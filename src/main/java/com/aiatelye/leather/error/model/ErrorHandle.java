package com.aiatelye.leather.error.model;

import com.aiatelye.leather.error.Exception.*;
import io.micrometer.common.lang.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;


@ControllerAdvice
@RestControllerAdvice
@Slf4j
public class ErrorHandle extends ResponseEntityExceptionHandler {

    private final MessageSource messageSource;

    public ErrorHandle(MessageSource messageSource) {
        this.messageSource = messageSource;
    }



    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        log.error("Sistemdə gözlənilməz xəta baş verdi: ", ex);
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.put("error", "Server Error");
        response.put("message", ex.getMessage()); // Bu sadəcə qısa mesajdır (Postman üçün)

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }


    @ExceptionHandler(FileEmptyException.class)
    public ResponseEntity<ErrorResponse> handleFileEmpty(FileEmptyException exception,
                                                         Locale locale) {
        log.error("FileEmptyException baş verdi: ", exception);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                        messageSource.getMessage(exception.getMessage(), null, locale)));
    }

    @ExceptionHandler(MinioCreatFaildException.class)
    public ResponseEntity<ErrorResponse> handleMinioCreateFaild(MinioCreatFaildException exception,
                                                                Locale locale) {
        log.error("MinioCreatFaildException baş verdi: ", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        messageSource.getMessage(exception.getMessage(), null, locale)));
    }


    @ExceptionHandler(FileInvalidTypeException.class)
    public ResponseEntity<ErrorResponse> handleFileInvalidType(FileInvalidTypeException exception,
                                                               Locale locale) {
        log.error("FileInvalidTypeException baş verdi: ", exception);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                        messageSource.getMessage(exception.getMessage(), exception.getArgs(), locale)));
    }

    @ExceptionHandler(FileTooLargeException.class)
    public ResponseEntity<ErrorResponse> handleFileTooLarge(FileTooLargeException exception,
                                                            Locale locale) {
        log.error("FileTooLargeException baş verdi: ", exception);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                        messageSource.getMessage(exception.getMessage(), exception.getArgs(), locale)));
    }



    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> BadRequest(BadRequestException exception,
                                                    Locale locale) {
        // DÜZƏLİŞ BURADADIR: 3-cü parametr kimi exception.getMessage() əlavə etdik
        String errorMessage = messageSource.getMessage(
                exception.getMessage(), // 1. Axtarılan açar
                null,                   // 2. Parametrlər
                exception.getMessage(), // 3. AÇAR TAPILMASA QAYTARILACAQ DEFAULT MESAJ (Sənin xilasedicin budur!)
                locale                  // 4. Dil
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(), errorMessage));
    }


    @ExceptionHandler(com.aiatelye.leather.error.Exception.PaymentFailedException.class)
    public ResponseEntity<ErrorResponse> PaymentFailed(com.aiatelye.leather.error.Exception.PaymentFailedException exception,
                                                       Locale locale) {
        String errorMessage = messageSource.getMessage(
                exception.getMessage(),
                null,
                exception.getMessage(),
                locale
        );

        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(new ErrorResponse(HttpStatus.BAD_GATEWAY.value(), errorMessage));
    }


    @ExceptionHandler(MultiFileLimitException.class)
    public ResponseEntity<ErrorResponse> handleMultiFileLimit(MultiFileLimitException exception,
                                                              Locale locale) {
        log.error("MultiFileLimitException baş verdi: ", exception);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                        messageSource.getMessage(exception.getMessage(), exception.getArgs(), locale)));
    }


    @ExceptionHandler(AddProductImagesException.class)
    public ResponseEntity<ErrorResponse> handleAddProductImages(AddProductImagesException exception,
                                                                Locale locale) {
        log.error("AddProductImagesException baş verdi: ", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        messageSource.getMessage(exception.getMessage(), exception.getArgs(), locale)));
    }

    @ExceptionHandler(ImageNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleImageNotFound(ImageNotFoundException exception,
                                                             Locale locale) {
        log.error("ImageNotFoundException baş verdi: ", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        messageSource.getMessage(exception.getMessage(), exception.getArgs(), locale)));
    }


    @ExceptionHandler(PrimaryImageException.class)
    public ResponseEntity<ErrorResponse> handlePrimaryImage(PrimaryImageException exception,
                                                            Locale locale) {
        log.error("PrimaryImageException baş verdi: ", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        messageSource.getMessage(exception.getMessage(), exception.getArgs(), locale)));
    }

    //burda qaldim
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> NotFoundException(NotFoundException exception,
                                                           Locale locale) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        messageSource.getMessage(exception.getMessage(), null, locale)));

    }

    @ExceptionHandler(InvalidStateTransitionException.class)
    public ResponseEntity<ErrorResponse> handleInvalidStateTransition(InvalidStateTransitionException exception,
                                                                      Locale locale) {
        log.error("InvalidStateTransitionException baş verdi: ", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        messageSource.getMessage(exception.getMessage(), exception.getArgs(), locale)));
    }


    @ExceptionHandler(MinioDeleteException.class)
    public ResponseEntity<ErrorResponse> handleMinioDelete(MinioDeleteException exception,
                                                           Locale locale) {
        log.error("MinioDeleteException baş verdi: ", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        messageSource.getMessage(exception.getMessage(), exception.getArgs(), locale)));
    }
    @ExceptionHandler(ImageFileRequired.class)
    public ResponseEntity<ErrorResponse> handleImageFileRequired(ImageFileRequired exception,
                                                                 Locale locale) {
        log.error("ImageFileRequired baş verdi: ", exception);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                        messageSource.getMessage(exception.getMessage(), exception.getArgs(), locale)));
    }


    @ExceptionHandler(ResourcePassiveException.class)
    public ResponseEntity<ErrorResponse> handleResourcePassive(ResourcePassiveException exception,
                                                               Locale locale) {
        log.error("ResourcePassiveException baş verdi: ", exception);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                        messageSource.getMessage(exception.getMessage(), exception.getArgs(), locale)));
    }

    @ExceptionHandler(PricingRuleAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handlePricingRuleExists(PricingRuleAlreadyExistsException exception,
                                                                 Locale locale) {
        log.error("PricingRuleAlreadyExistsException baş verdi: ", exception);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                        messageSource.getMessage(exception.getMessage(), exception.getArgs(), locale)));
    }


    @ExceptionHandler(BaseCurrencyUpdateException.class)
    public ResponseEntity<ErrorResponse> handleBaseCurrencyUpdate(BaseCurrencyUpdateException exception,
                                                                  Locale locale) {
        log.error("BaseCurrencyUpdateException baş verdi: ", exception);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                        messageSource.getMessage(exception.getMessage(), exception.getArgs(), locale)));
    }


    @ExceptionHandler(BaseProductGradePriceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleBasePriceNotFound(BaseProductGradePriceNotFoundException exception,
                                                                 Locale locale) {
        log.error("BaseProductGradePriceNotFoundException baş verdi: ", exception);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                        messageSource.getMessage(exception.getMessage(), exception.getArgs(), locale)));
    }


    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> BaseCurrencyUpdateException(DataIntegrityViolationException exception,
                                                                     Locale locale) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(HttpStatus.CONFLICT.value(),
                        messageSource.getMessage("""
  This product combination is already available in your order.""",
                                null,locale)));

    }


    @ExceptionHandler(OrderSpesificationException.class)
    public ResponseEntity<ErrorResponse> BaseCurrencyUpdateException(OrderSpesificationException exception,
                                                                     Locale locale) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        messageSource.getMessage("""
                               We are unable to load the order list at the moment. 
                                Please refresh the page or contact support if the issue persists.
                                """,null,locale)));
    }




    @ExceptionHandler(InvalidOrderStatusTransitionException.class)
    public ResponseEntity<ErrorResponse> InvalidOrderStatusTransitionException(InvalidStateTransitionException exception,
                                                                               Locale locale) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                        messageSource.getMessage(exception.getMessage(), null,locale)));
    }


    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> ConflictException(ConflictException exception,
                                                           Locale locale) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(HttpStatus.CONFLICT.value(),
                        messageSource.getMessage("""
 Shipping location already exists for this country and city".""",
                                null,locale)));

    }

    @ExceptionHandler(PostalCodeRequiredException.class)
    public ResponseEntity<ErrorResponse> PostalCodeRequiredException(PostalCodeRequiredException exception,
                                                                     Locale locale) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                        messageSource.getMessage(exception.getMessage(), null,locale)));
    }

    @ExceptionHandler(PriceMismatchException.class)
    public ResponseEntity<ErrorResponse> PriceMismatchException(PriceMismatchException exception,
                                                                Locale locale) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(HttpStatus.CONFLICT.value(),
                        messageSource.getMessage(exception.getMessage(), null,locale)));
    }


    @ExceptionHandler(OrderAlreadyProcessingException.class)
    public ResponseEntity<ErrorResponse> OrderAlreadyProcessingException(OrderAlreadyProcessingException exception,
                                                                         Locale locale) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(HttpStatus.CONFLICT.value(),
                        messageSource.getMessage(exception.getMessage(), null,locale)));
    }


    @ExceptionHandler(OrderAlreadyCreatedException.class)
    public ResponseEntity<ErrorResponse> OrderAlreadyCreatedException(OrderAlreadyCreatedException exception,
                                                                      Locale locale) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(HttpStatus.CONFLICT.value(),
                        messageSource.getMessage(exception.getMessage(), null,locale)));
    }


    @ExceptionHandler(DuplicateOrderException.class)
    public ResponseEntity<ErrorResponse> DuplicateOrderException(DuplicateOrderException exception,
                                                                 Locale locale) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(HttpStatus.CONFLICT.value(),
                        messageSource.getMessage(exception.getMessage(), null,locale)));
    }


    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> UnauthorizedException(UnauthorizedException exception,
                                                               Locale locale) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(HttpStatus.FORBIDDEN.value(),
                        messageSource.getMessage(exception.getMessage(), null,locale)));
    }

    @ExceptionHandler(OrderCannotBeCancelledException.class)
    public ResponseEntity<ErrorResponse> OrderCannotBeCancelledException(OrderCannotBeCancelledException exception,
                                                                         Locale locale) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(HttpStatus.FORBIDDEN.value(),
                        messageSource.getMessage(exception.getMessage(), null,locale)));
    }


    @ExceptionHandler(InsufficientQuotaException.class)
    public ResponseEntity<ErrorResponse> InsufficientQuotaException(InsufficientQuotaException exception,
                                                                    Locale locale) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(new ErrorResponse(HttpStatus.TOO_MANY_REQUESTS.value(),
                        messageSource.getMessage("\"The daily custom design limit has been exceeded.: "+exception.getMessage(), null,locale)));
    }


    @ExceptionHandler(DailyUsageLimitException.class)
    public ResponseEntity<ErrorResponse> DailyUsageLimitException(DailyUsageLimitException exception,
                                                                  Locale locale) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(new ErrorResponse(HttpStatus.TOO_MANY_REQUESTS.value(),
                        messageSource.getMessage(" Daily standard design limit is over " ,null,locale)));
    }


    @ExceptionHandler(UserLimitNotFoundException.class)
    public ResponseEntity<ErrorResponse> UserLimitNotFoundException(UserLimitNotFoundException exception,
                                                                    Locale locale) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(HttpStatus.FORBIDDEN.value(),
                        messageSource.getMessage(exception.getMessage(), null,locale)));
    }


    @ExceptionHandler(UserCustomLimitNotFound.class)
    public ResponseEntity<ErrorResponse> UserCustomLimitNotFound(UserCustomLimitNotFound exception,
                                                                 Locale locale) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(HttpStatus.FORBIDDEN.value(),
                        messageSource.getMessage(exception.getMessage(), null,locale)));
    }



    @ExceptionHandler(AiCustomDesingProssesingException.class)
    public ResponseEntity<ErrorResponse> AiPrepossessingException(AiCustomDesingProssesingException exception,
                                                                  Locale locale) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        messageSource.getMessage(exception.getMessage(), null,locale)));
    }

    @ExceptionHandler(AiStandardDesignProcessingException.class)
    public ResponseEntity<ErrorResponse> AiStandartDesingProssesingException(AiStandardDesignProcessingException exception,
                                                                             Locale locale) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        messageSource.getMessage(exception.getMessage(), null,locale)));
    }

    @ExceptionHandler(AIImageProcessingException.class)
    public ResponseEntity<ErrorResponse> AIImageProcessingException(AIImageProcessingException exception,
                                                                    Locale locale) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        messageSource.getMessage(exception.getMessage(), null,locale)));
    }
    @ExceptionHandler(DesignNotFoundException.class)
    public ResponseEntity<ErrorResponse> AIImageProcessingException(DesignNotFoundException exception,
                                                                    Locale locale) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(HttpStatus.NOT_FOUND.value(),
                        messageSource.getMessage(exception.getMessage(), null,locale)));
    }




    //coming Error for Handle from Validation
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            @NonNull HttpHeaders headers,
            @NonNull HttpStatusCode status,
            @NonNull WebRequest request) {

        List<FieldValidationError> validations = ex.getFieldErrors().stream()
                .map(fieldError -> new FieldValidationError(
                        fieldError.getField(),
                        fieldError.getDefaultMessage()
                ))
                .toList();

        FiledErrorResponse body = new FiledErrorResponse(
                "Validation failed",
                validations
        );

        return handleExceptionInternal(ex, body, headers, HttpStatus.BAD_REQUEST, request);
    }



}
