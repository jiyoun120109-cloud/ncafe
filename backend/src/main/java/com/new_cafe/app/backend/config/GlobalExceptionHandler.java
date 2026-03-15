package com.new_cafe.app.backend.config;

import org.springframework.dao.DataIntegrityViolationException;
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

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String message = "해당 리소스를 참조하는 데이터가 있어 삭제할 수 없습니다.";
        HttpStatus status = HttpStatus.CONFLICT;
        if (ex.getMessage() != null && ex.getMessage().contains("category")) {
            message = "해당 카테고리에 메뉴가 있어 삭제할 수 없습니다.";
        } else if (ex.getMessage() != null && (ex.getMessage().contains("orders") || ex.getMessage().contains("user") || ex.getMessage().contains("order_items"))) {
            message = "주문 저장에 실패했습니다. 로그인 상태를 확인한 뒤 다시 시도해 주세요.";
            // customer_id/user_id NOT NULL 위반 등 → 세션 미전달 가능성. 401로 재로그인 유도
            String msg = ex.getMessage();
            if (msg.contains("null") && (msg.contains("customer_id") || msg.contains("user_id"))) {
                message = "로그인 세션이 만료되었습니다. 다시 로그인한 뒤 주문해 주세요.";
                status = HttpStatus.UNAUTHORIZED;
            }
        }
        return ResponseEntity
                .status(status)
                .body(Map.of("error", status == HttpStatus.UNAUTHORIZED ? "Unauthorized" : "Conflict", "message", message));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        String msg = ex.getMessage() != null ? ex.getMessage() : "리소스를 찾을 수 없습니다.";
        boolean isValidation = msg.contains("이름을 입력") || msg.contains("이름을 입력해");
        return ResponseEntity
                .status(isValidation ? HttpStatus.BAD_REQUEST : HttpStatus.NOT_FOUND)
                .body(Map.of("error", isValidation ? "Bad Request" : "Not Found", "message", msg));
    }

    @ExceptionHandler(NumberFormatException.class)
    public ResponseEntity<Map<String, String>> handleNumberFormat(NumberFormatException ex) {
        String message = ex.getMessage() != null && !ex.getMessage().isBlank()
                ? "잘못된 형식입니다: " + ex.getMessage()
                : "잘못된 숫자 형식입니다.";
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Bad Request", "message", message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception ex) {
        String message = ex.getMessage() != null && !ex.getMessage().isBlank()
                ? ex.getMessage()
                : "서버 오류가 발생했습니다.";
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal Server Error", "message", message));
    }
}
