package com.aiatelye.leather.service.Order;

import com.aiatelye.leather.cache.OrderIdempotencyCacheRepository;
import com.aiatelye.leather.componet.OrderNumberGenerator;
import com.aiatelye.leather.dao.*;
import com.aiatelye.leather.dto.admin.order.OrderDetailResponse;
import com.aiatelye.leather.dto.defalutResponse.PageResponse;
import com.aiatelye.leather.dto.order.CreateOrderRequest;
import com.aiatelye.leather.dto.order.OrderResponse;
import com.aiatelye.leather.dto.order.OrderSummaryResponse;
import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.error.Exception.*;
import com.aiatelye.leather.error.Exception.OrderCannotBeCancelledException;
import com.aiatelye.leather.mapper.OrderMapper;
import com.aiatelye.leather.repository.*;
import com.aiatelye.leather.service.pricing.CalculatePriceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final LeatherRepository leatherRepository;
    private final OrderMapper orderMapper;
    private final OrderIdempotencyCacheRepository idempotencyCache;
    private final OrderNumberGenerator orderNumberGenerator;
    private final CalculatePriceService calculatePriceService;
    private final ShipingService shippingService; // Sizin ShippingService
    private final ShippingLocationRepository shippingLocationRepository;

    @Transactional
    public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
        log.info("Creating order for user: {}, items: {}, currency: {}",
                userId, request.getItems().size(), request.getCurrency());

        String idempotencyKey = request.getIdempotencyKey();
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            validateIdempotency(userId, idempotencyKey);
        }

        try {
            User user = userRepository.findById((long) Math.toIntExact(userId))
                    .orElseThrow(() -> new NotFoundException("User not found  " + userId));

            // Postal code validation
            validatePostalCodeIfRequired(
                    request.getCountry(),
                    request.getPostalCode(),
                    request.getCurrency()
            );

            Order order = Order.builder()
                    .orderNumber(orderNumberGenerator.generate())
                    .user(user)
                    .customerEmail(user.getEmail())
                    .customerPhone(request.getCustomerPhone())
                    .orderType(request.getOrderType())
                    .status(Enums.OrderStatus.PENDING)
                    .paymentStatus(Enums.PaymentStatus.WAITING)
                    .designStatus(request.getOrderType() == Enums.OrderType.AI_CUSTOM_DESIGN
                            ? Enums.DesignProcessStatus.GENERATING
                            : null)
                    .currency(request.getCurrency())
                    .deliveryAddress(formatAddressWithPostalCode(request.getDeliveryAddress(), request.getPostalCode()))
                    .notes(request.getNotes())
                    .build();

            List<OrderItem> orderItems = new ArrayList<>();
            BigDecimal subTotal = BigDecimal.ZERO;

            for (CreateOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
                OrderItem orderItem = createOrderItemWithPriceGuard(
                        itemRequest,
                        order,
                        request.getCurrency()
                );

                orderItems.add(orderItem);
                subTotal = subTotal.add(orderItem.getTotalPrice());
            }

            BigDecimal shippingFee = shippingService.calculate(
                    request.getCountry(),
                    request.getCityName(),
                    request.getCurrency(),
                    subTotal
            );

            order.setSubTotal(subTotal);
            order.setShippingFee(shippingFee);
            order.setFinalPrice(subTotal.add(shippingFee));
            order.setOrderItems(orderItems);

            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                order.setIdempotencyKey(idempotencyKey);
            }

            Order savedOrder = orderRepository.save(order);
            orderItemRepository.saveAll(orderItems);

            log.info("Order created: {} for user: {}, total: {}",
                    savedOrder.getOrderNumber(), userId, savedOrder.getFinalPrice());

            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                // Redis-i dərhal yox, yalnız DB COMMIT olduqdan sonra yeniləyirik
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        idempotencyCache.markCompleted(idempotencyKey, userId.toString(), savedOrder.getOrderNumber());
                    }
                });}

            return orderMapper.toResponse(savedOrder);

        } catch (PriceMismatchException | PostalCodeRequiredException e) {
            // 1. GÖZLƏNİLƏN BİZNES XƏTALARI (Sənin Custom Exception-ların)
            handleCleanup(idempotencyKey, userId);
            throw e; // Olduğu kimi ötür, Handler tutacaq.

        } catch (DataIntegrityViolationException e) {
            // 2. BAZA SƏVİYYƏSİNDƏ TOQQUŞMA (Unique Constraint)
            handleCleanup(idempotencyKey, userId);
            log.error("Duplicate Order detected in DB for User: {}", userId);
            throw new DuplicateOrderException("error.order.duplicate");

        } catch (Exception e) {
            // 3. GÖZLƏNİLMEZ TEXNİKİ XƏTA (ServerError dərəcəli)
            handleCleanup(idempotencyKey, userId);
            log.error("SYSTEM ERROR | User: {} | Trace: ", userId, e);

            // Bura sənin dediyin o "ServerError" tipli xətanı ata bilərsən
            throw new RuntimeException("error.technical.internal");
        }
    }

    private void validatePostalCodeIfRequired(Enums.Country country, String postalCode, Enums.Currency currency) {
        Optional<ShippingLocation> countryDefault = shippingLocationRepository
                .findByCountryAndCityNameIsNullAndCurrencyAndIsActiveTrue(country, currency);

        // 2. Əgər konkret ölkə tapılmadısa, Qlobal (INTERNATIONAL_OTHER) tənzimləməni gətiririk
        if (countryDefault.isEmpty()) {
            countryDefault = shippingLocationRepository
                    .findByCountryAndCityNameIsNullAndCurrencyAndIsActiveTrue(Enums.Country.INTERNATIONAL_OTHER, currency);
        }

        if (countryDefault.isPresent() &&
                Boolean.TRUE.equals(countryDefault.get().getRequiresPostalCode()) &&
                (postalCode == null || postalCode.isBlank())) {
            throw new PostalCodeRequiredException(country + " Postal code is required for");
        }
    }

    private String formatAddressWithPostalCode(String deliveryAddress, String postalCode) {
        if (postalCode != null && !postalCode.isBlank()) {
            return deliveryAddress + ", Postal: " + postalCode;
        }
        return deliveryAddress;
    }

    private OrderItem createOrderItemWithPriceGuard(
            CreateOrderRequest.OrderItemRequest itemRequest,
            Order order,
            Enums.Currency currency) {

        Long gradeId = getGradeIdFromLeather(itemRequest.getLeatherId());

        BigDecimal realUnitPrice = calculatePriceService.getCalculatedPrice(
                itemRequest.getProductModelId(),
                gradeId,
                currency
        ).getAmount();

        BigDecimal frontendPrice = itemRequest.getUnitPrice();

        if (realUnitPrice.compareTo(frontendPrice) != 0) {
            log.error("PRICE GUARD: Product: {}, Expected: {}, Got: {}",
                    itemRequest.getProductModelId(), realUnitPrice, frontendPrice);
            throw new PriceMismatchException("The price has changed, please refresh the page.");
        }

        OrderItem orderItem = OrderItem.builder()
                .order(order)
                .productModelId(itemRequest.getProductModelId())
                .productModelName(itemRequest.getProductModelName())
                .leatherId(itemRequest.getLeatherId())
                .leatherName(itemRequest.getLeatherName())
                .renderImageUrl(itemRequest.getRenderImageUrl())
                .designId(itemRequest.getDesignId())
                .quantity(itemRequest.getQuantity())
                .unitPrice(realUnitPrice)
                .build();

        orderItem.calculateTotal();

        return orderItem;
    }

    private Long getGradeIdFromLeather(Long leatherId) {
        return leatherRepository.findById(leatherId)
                .map(Leather::getGrade)
                .map(LeatherGrade::getId)
                .orElseThrow(() -> new NotFoundException("Leather not found: " + leatherId));
    }

    private void validateIdempotency(Long userId, String idempotencyKey) {
        String redisStatus = idempotencyCache.getStatus(idempotencyKey, userId.toString());

        if ("processing".equals(redisStatus)) {
            throw new OrderAlreadyProcessingException("Order is being processed.");
        }

        if (redisStatus != null && redisStatus.startsWith("ORD-")) {
            throw new OrderAlreadyCreatedException("The file has already been created: " + redisStatus);
        }

        boolean existsInDb = orderRepository.existsRecentByUserAndIdempotencyKey(
                userId,
                idempotencyKey,
                LocalDateTime.now().minusMinutes(5)
        );

        if (existsInDb) {
            throw new DuplicateOrderException("This order is already available");
        }

        boolean locked = idempotencyCache.tryLock(idempotencyKey, userId.toString());
        if (!locked) {
            throw new OrderAlreadyProcessingException("Order is being processed.");
        }
}
    private void handleCleanup(String key, Long userId) {
        // 1. Yoxlayırıq: Key varmı? (Boş ola bilər)
        if (key != null && !key.isBlank()) {
            log.info("Cleaning up idempotency lock for user: {}", userId);

            // 2. Redis-dəki kilidi açırıq ki, müştəri yenidən cəhd edə bilsin
            idempotencyCache.unlock(key, userId.toString());
        }

    }




    @Transactional(readOnly = true)
    public PageResponse<OrderSummaryResponse> getMyOrders(long userId, int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Order> pageResult = orderRepository.findByUserId(userId, pageable);

        List<OrderSummaryResponse> content = pageResult.getContent().stream()
                .map(orderMapper::toSummaryResponse)
                .toList();

        return PageResponse.<OrderSummaryResponse>builder()
                .content(content)
                .pageNumber(pageResult.getNumber())
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }



    @Transactional(readOnly = true)
    public OrderDetailResponse getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findByIdWithDetailswithuser(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        // sifarişin sahibi deyilsə -> Giriş qadağandır
        if (!Objects.equals(order.getUser().getId(), userId)) {
            log.warn("Unauthorized access attempt: User {} tried to view Order {} of User {}",
                    userId, orderId, order.getUser().getId());
            throw new UnauthorizedException("You can only view your own orders");
        }

        return orderMapper.toDetailResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        // Təhlükəsizlik: Yalnız öz sifarişini ləğv edə bilər
        if (!Objects.equals(order.getUser().getId(), userId)) {
            throw new UnauthorizedException("You can only cancel your own orders");
        }

        if (order.getStatus() == Enums.OrderStatus.CANCELLED) {
            return orderMapper.toResponse(order); // Artıq ləğv edilibsə, sadəcə cavab ver
        }

        // Yalnız PENDING status-da ləğv edilə bilər
        if (order.getStatus() != Enums.OrderStatus.PENDING) {
            throw new OrderCannotBeCancelledException(
                    "Order cannot be cancelled. Current status: " + order.getStatus()
            );
        }

        order.setStatus(Enums.OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);

        log.info("Order cancelled: {} by user: {}", savedOrder.getOrderNumber(), userId);

        return orderMapper.toResponse(savedOrder);
    }
}
