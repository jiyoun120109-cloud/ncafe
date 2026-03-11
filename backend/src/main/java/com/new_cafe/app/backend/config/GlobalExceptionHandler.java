package com.new_cafe.app.backend.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * API 예외 처리 — 400 등 에러 시 JSON 메시지 반환
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        String message = "요청 본문을 읽을 수 없습니다.";
        Throwable cause = ex.getCause();
        if (cause != null && cause.getMessage() != null && !cause.getMessage().isBlank()) {
            message = "JSON 형식 오류: " + cause.getMessage();
        } else if (ex.getMessage() != null && !ex.getMessage().isBlank()) {
            message = ex.getMessage();
        }
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Bad Request", "message", message));
    }
}
