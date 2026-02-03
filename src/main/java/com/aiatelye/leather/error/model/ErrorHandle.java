package com.aiatelye.leather.error.model;

import com.aiatelye.leather.error.Exception.*;
import io.micrometer.common.lang.NonNull;
import org.springframework.context.MessageSource;
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
    public ResponseEntity<ErrorResponse> MinioException(BadRequestException exception,
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
    public ResponseEntity<ErrorResponse> PrimaryImageException(NotFoundException exception,
                                                               Locale locale) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        messageSource.getMessage(exception.getMessage(), null, locale)));

    }
    @ExceptionHandler(InvalidStateTransitionException.class)
    public ResponseEntity<ErrorResponse> PrimaryImageException(InvalidStateTransitionException exception,
                                                               Locale locale) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        messageSource.getMessage(exception.getMessage(), null, locale)));

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
