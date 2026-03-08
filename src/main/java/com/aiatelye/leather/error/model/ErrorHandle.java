package com.aiatelye.leather.error.model;

import com.aiatelye.leather.error.Exception.*;
import io.micrometer.common.lang.NonNull;
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
public class ErrorHandle extends ResponseEntityExceptionHandler {

    private final MessageSource messageSource;

    public ErrorHandle(MessageSource messageSource) {
        this.messageSource = messageSource;
    }


    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApiException(ApiException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", ex.getStatusCode());
        response.put("error", ex.getClass().getSimpleName());
        response.put("message", ex.getMessage());

        return new ResponseEntity<>(response, HttpStatusCode.valueOf(ex.getStatusCode()));
    }

    //comming error from Server:
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.put("error", "Server Error");
        response.put("message", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }


    @ExceptionHandler(FileEmptyException.class)
    public ResponseEntity<ErrorResponse> MinioException(FileEmptyException exception,
                                                                     Locale locale) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                        messageSource.getMessage("Minio Bucket exception", null, locale)));

    }
    @ExceptionHandler(MinioCreatFaildException.class)
    public ResponseEntity<ErrorResponse> MinioException(MinioCreatFaildException exception,
                                                        Locale locale) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        messageSource.getMessage("Minio Bucket exception", null, locale)));

    }
    @ExceptionHandler(FileInvalidTypeException.class)
    public ResponseEntity<ErrorResponse> MinioException(FileInvalidTypeException exception,
                                                        Locale locale) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                        messageSource.getMessage("Minio Bucket exception", null, locale)));

    }
    @ExceptionHandler(FileTooLargeException.class)
    public ResponseEntity<ErrorResponse> MinioException(FileTooLargeException exception,
                                                        Locale locale) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                        messageSource.getMessage("Minio Bucket exception", null, locale)));

    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> BadRequest(BadRequestException exception,
                                                        Locale locale) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                        messageSource.getMessage(exception.getMessage(), null, locale)));

    }
    @ExceptionHandler(MultiFileLimitException.class)
    public ResponseEntity<ErrorResponse> MultiFileLimitException(MultiFileLimitException exception,
                                                        Locale locale) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                        messageSource.getMessage("There can be max 6 pictures", null, locale)));

    }

    @ExceptionHandler(AddProductImagesException.class)
    public ResponseEntity<ErrorResponse> MultiFileLimitException(AddProductImagesException exception,
                                                                 Locale locale) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        messageSource.getMessage(" add Product images failed", null, locale)));

    }

    @ExceptionHandler(ImageNotFoundException.class)
    public ResponseEntity<ErrorResponse>  ImageNotFoundException(ImageNotFoundException exception,
                                                                 Locale locale) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        messageSource.getMessage(exception.getMessage(), null, locale)));

    }


    @ExceptionHandler(PrimaryImageException.class)
    public ResponseEntity<ErrorResponse> PrimaryImageException(PrimaryImageException exception,
                                                                 Locale locale) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        messageSource.getMessage("Cannot delete primary image", null, locale)));

    }


    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> NotFoundException(NotFoundException exception,
                                                               Locale locale) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        messageSource.getMessage(exception.getMessage(), null, locale)));

    }
    @ExceptionHandler(InvalidStateTransitionException.class)
    public ResponseEntity<ErrorResponse> InvalidStateTransitionException(InvalidStateTransitionException exception,
                                                               Locale locale) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        messageSource.getMessage("It is not possible to change the product status from" +
                                " the current status to the status you selected directly. " +
                                "Please follow the sequence.", null, locale)));



    }

    @ExceptionHandler(MinioDeleteException.class)
    public ResponseEntity<ErrorResponse> MinioDeleteException(MinioDeleteException exception,
                                                               Locale locale) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        messageSource.getMessage(exception.getMessage(), null, locale)));

    }

    @ExceptionHandler(ImageFileRequired.class)
    public ResponseEntity<ErrorResponse> ImageFileRequired(ImageFileRequired exception,
                                                               Locale locale) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                        messageSource.getMessage("Image file is required", null,locale)));

    }


    @ExceptionHandler(ResourcePassiveException.class)
    public ResponseEntity<ErrorResponse> ResourcePassiveException(ResourcePassiveException exception,
                                                               Locale locale) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                        messageSource.getMessage("""
  Dear user, the product (or service) you selected is currently not active or has been deleted.
   This cannot be undone. For support: [number]""", null,locale)));

    }

    @ExceptionHandler(PricingRuleAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> PricingRuleAlreadyExistsException(PricingRuleAlreadyExistsException exception,
                                                                  Locale locale) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                        messageSource.getMessage("""
  Pricing rule already exists for currency""", null,locale)));

    }

    @ExceptionHandler(BaseCurrencyUpdateException.class)
    public ResponseEntity<ErrorResponse> BaseCurrencyUpdateException(BaseCurrencyUpdateException exception,
                                                                           Locale locale) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                        messageSource.getMessage("""
  Cannot update pricing rule for base currency (AZN)""", null,locale)));

    }


    @ExceptionHandler(BaseProductGradePriceNotFoundException.class)
    public ResponseEntity<ErrorResponse> BaseCurrencyUpdateException(BaseProductGradePriceNotFoundException exception,
                                                                     Locale locale) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(),
                        messageSource.getMessage("""
  C Price configuration error: The base price (AZN) for this item has not been set yet. 
  Please define the AZN price first to enable USD/EUR calculations or manual overrides""",
                                null,locale)));

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
