package com.new_cafe.app.backend.payment.adapter.out.tosspayments;

import com.new_cafe.app.backend.order.application.port.in.GetOrderUseCase;
import com.new_cafe.app.backend.order.model.Order;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
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

    private static final String CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";

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
     * paymentKey로 결제 승인 요청 후 금액·주문 일치 여부 검증.
     * secretKey가 비어 있으면 검증 생략.
     */
    @SuppressWarnings("unchecked")
    public void verifyAndConfirm(String paymentKey, Long orderId, GetOrderUseCase getOrderUseCase) {
        if (secretKey == null || secretKey.isBlank()) {
            return;
        }
        if (paymentKey == null || paymentKey.isBlank()) {
            throw new IllegalArgumentException("결제 키가 없습니다. 토스페이먼츠 결제 후 다시 시도해 주세요.");
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
            if (e.getStatusCode().value() == 400) {
                String responseBody = e.getResponseBodyAsString();
                if (responseBody != null && responseBody.contains("ALREADY_PROCESSED_PAYMENT")) {
                    return;
                }
            }
            throw e;
        }
    }
}
