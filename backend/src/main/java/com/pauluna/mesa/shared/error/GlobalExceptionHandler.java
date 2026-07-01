package com.pauluna.mesa.shared.error;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.pauluna.mesa.auth.application.InvalidCredentialsException;
import com.pauluna.mesa.group.application.GroupAccessDeniedException;
import com.pauluna.mesa.group.application.GroupMemberAlreadyExistsException;
import com.pauluna.mesa.group.application.GroupMemberNotFoundException;
import com.pauluna.mesa.group.application.GroupNotFoundException;
import com.pauluna.mesa.group.application.GroupOwnerAccessRequiredException;
import com.pauluna.mesa.group.application.GroupOwnerCannotBeRemovedException;
import com.pauluna.mesa.restaurant.application.GroupRestaurantNotFoundException;
import com.pauluna.mesa.restaurant.application.InvalidRestaurantDataException;
import com.pauluna.mesa.restaurant.application.RestaurantAlreadyInGroupException;
import com.pauluna.mesa.restaurant.application.RestaurantNotFoundException;
import com.pauluna.mesa.user.application.DuplicateUserException;
import com.pauluna.mesa.user.application.UserNotFoundByUsernameException;
import com.pauluna.mesa.user.application.UserNotFoundException;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DuplicateUserException.class)
    public ResponseEntity<ApiError> handleDuplicateUser(
            DuplicateUserException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiError> handleInvalidCredentials(
            InvalidCredentialsException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.UNAUTHORIZED,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiError> handleUserNotFound(
            UserNotFoundException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(UserNotFoundByUsernameException.class)
    public ResponseEntity<ApiError> handleUserNotFoundByUsername(
            UserNotFoundByUsernameException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(GroupNotFoundException.class)
    public ResponseEntity<ApiError> handleGroupNotFound(
            GroupNotFoundException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(GroupAccessDeniedException.class)
    public ResponseEntity<ApiError> handleGroupAccessDenied(
            GroupAccessDeniedException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.FORBIDDEN,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(GroupOwnerAccessRequiredException.class)
    public ResponseEntity<ApiError> handleGroupOwnerAccessRequired(
            GroupOwnerAccessRequiredException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.FORBIDDEN,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(GroupMemberNotFoundException.class)
    public ResponseEntity<ApiError> handleGroupMemberNotFound(
            GroupMemberNotFoundException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(GroupMemberAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleGroupMemberAlreadyExists(
            GroupMemberAlreadyExistsException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(GroupOwnerCannotBeRemovedException.class)
    public ResponseEntity<ApiError> handleGroupOwnerCannotBeRemoved(
            GroupOwnerCannotBeRemovedException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(GroupRestaurantNotFoundException.class)
    public ResponseEntity<ApiError> handleGroupRestaurantNotFound(
            GroupRestaurantNotFoundException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(RestaurantNotFoundException.class)
    public ResponseEntity<ApiError> handleRestaurantNotFound(
            RestaurantNotFoundException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(RestaurantAlreadyInGroupException.class)
    public ResponseEntity<ApiError> handleRestaurantAlreadyInGroup(
            RestaurantAlreadyInGroupException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(InvalidRestaurantDataException.class)
    public ResponseEntity<ApiError> handleInvalidRestaurantData(
            InvalidRestaurantDataException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        Map<String, String> validationErrors =
                new LinkedHashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(fieldError ->
                        validationErrors.putIfAbsent(
                                fieldError.getField(),
                                fieldError.getDefaultMessage()
                        )
                );

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "La petición contiene datos no válidos.",
                request.getRequestURI(),
                validationErrors
        );
    }

    private ResponseEntity<ApiError> buildResponse(
            HttpStatus status,
            String message,
            String path,
            Map<String, String> validationErrors
    ) {
        ApiError apiError = new ApiError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                path,
                validationErrors
        );

        return ResponseEntity
                .status(status)
                .body(apiError);
    }
}