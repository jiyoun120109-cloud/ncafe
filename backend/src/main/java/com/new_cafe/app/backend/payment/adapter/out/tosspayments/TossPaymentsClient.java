package com.new_cafe.app.backend.payment.adapter.out.tosspayments;

import com.new_cafe.app.backend.order.application.port.in.GetOrderUseCase;
import com.new_cafe.app.backend.order.model.Order;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;

/**
 * 토스페이먼츠 V1 API: 결제 승인(confirm)으로 검증.
 * Basic Auth: secretKey + ":" 를 Base64 인코딩.
 */
@Component
public class TossPaymentsClient {

    private static final String BASE_URL = "https://api.tosspayments.com/v1/payments";
    private static final String CONFIRM_URL = BASE_URL + "/confirm";

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${toss.secret-key:}")
    private String secretKey;

    /** 토스 orderId 형식: 6~64자. 내부 주문 ID와 매핑 (예: ncafe-123) */
    public static String toTossOrderId(Long orderId) {
        return "ncafe-" + orderId;
    }

    public boolean isConfigured() {
        return secretKey != null && !secretKey.isBlank();
    }

    /**
     * GET /v1/payments/{paymentKey} 로 결제 상태 조회. 이미 DONE이면 confirm 생략.
     */
    @SuppressWarnings("unchecked")
    private boolean isPaymentDone(String paymentKey) {
        if (secretKey == null || secretKey.isBlank() || paymentKey == null || paymentKey.isBlank()) {
            return false;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Basic " + Base64.getEncoder().encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8)));
            HttpEntity<Void> getRequest = new HttpEntity<>(headers);
            ResponseEntity<Map> res = restTemplate.exchange(
                    BASE_URL + "/" + paymentKey,
                    HttpMethod.GET,
                    getRequest,
                    Map.class
            );
            Map<String, Object> body = res.getBody();
            if (body == null) return false;
            Object statusObj = body.get("status");
            return "DONE".equalsIgnoreCase(statusObj != null ? statusObj.toString() : "");
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * paymentKey로 결제 승인 요청 후 금액·주문 일치 여부 검증.
     * - 결제 상태가 이미 DONE이면 confirm 생략.
     * - ALREADY_PROCESSED_PAYMENT / ALREADY_PROCESSING_REQUEST(400) → 성공으로 간주.
     * - 429 Too Many Requests → 사용자 안내 메시지로 변환.
     */
    @SuppressWarnings("unchecked")
    public void verifyAndConfirm(String paymentKey, Long orderId, GetOrderUseCase getOrderUseCase) {
        if (secretKey == null || secretKey.isBlank()) {
            return;
        }
        if (paymentKey == null || paymentKey.isBlank()) {
            throw new IllegalArgumentException("결제 키가 없습니다. 토스페이먼츠 결제 후 다시 시도해 주세요.");
        }
        if (isPaymentDone(paymentKey)) {
            return;
        }
        Optional<Order> orderOpt = getOrderUseCase.getById(orderId);
        if (orderOpt.isEmpty()) {
            throw new IllegalArgumentException("주문을 찾을 수 없습니다.");
        }
        Order order = orderOpt.get();
        long expectedAmount = order.getTotalAmount() != null ? order.getTotalAmount().longValue() : 0L;
        String orderIdForToss = toTossOrderId(orderId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String auth = secretKey + ":";
        headers.set("Authorization", "Basic " + Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8)));

        Map<String, Object> body = Map.of(
                "paymentKey", paymentKey,
                "orderId", orderIdForToss,
                "amount", expectedAmount
        );
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        try {
            ResponseEntity<Map> res = restTemplate.postForEntity(CONFIRM_URL, request, Map.class);
            if (res.getBody() == null) {
                throw new IllegalStateException("토스페이먼츠 결제 승인 응답이 비어 있습니다.");
            }
            Map<String, Object> payment = res.getBody();
            Object statusObj = payment.get("status");
            String status = statusObj != null ? statusObj.toString() : "";
            if (!"DONE".equalsIgnoreCase(status)) {
                throw new IllegalStateException("결제가 완료되지 않았습니다. status=" + status);
            }
            Object amountObj = payment.get("totalAmount");
            long actualAmount = amountObj instanceof Number ? ((Number) amountObj).longValue() : Long.parseLong(String.valueOf(amountObj));
            if (actualAmount != expectedAmount) {
                throw new IllegalStateException("결제 금액이 일치하지 않습니다. expected=" + expectedAmount + ", actual=" + actualAmount);
            }
        } catch (HttpStatusCodeException e) {
            int code = e.getStatusCode().value();
            String responseBody = e.getResponseBodyAsString();
            if (code == 400 && responseBody != null) {
                if (responseBody.contains("ALREADY_PROCESSED_PAYMENT") || responseBody.contains("ALREADY_PROCESSING_REQUEST")) {
                    return;
                }
            }
            if (code == 429) {
                throw new IllegalStateException("요청이 많습니다. 잠시 후 다시 시도해 주세요.");
            }
            throw e;
        }
    }
}
