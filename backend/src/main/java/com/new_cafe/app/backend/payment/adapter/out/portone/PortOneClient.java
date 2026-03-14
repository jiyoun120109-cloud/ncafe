package com.new_cafe.app.backend.payment.adapter.out.portone;

import com.new_cafe.app.backend.order.application.port.in.GetOrderUseCase;
import com.new_cafe.app.backend.order.model.Order;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;

/**
 * 포트원(아임포트) V1 API 연동: 토큰 발급 후 결제 조회로 검증.
 */
@Component
public class PortOneClient {

    private static final String TOKEN_URL = "https://api.iamport.kr/users/getToken";
    private static final String PAYMENTS_URL = "https://api.iamport.kr/payments/";

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${portone.api-key:}")
    private String apiKey;

    @Value("${portone.api-secret:}")
    private String apiSecret;

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank() && apiSecret != null && !apiSecret.isBlank();
    }

    /**
     * imp_uid(결제 거래번호)로 포트원에 결제 조회 후 금액·상태 검증.
     * api-key/secret 이 비어 있으면 검증 생략.
     */
    @SuppressWarnings("unchecked")
    public void verifyPayment(String impUid, Long orderId, GetOrderUseCase getOrderUseCase) {
        if (apiKey == null || apiKey.isBlank() || apiSecret == null || apiSecret.isBlank()) {
            return;
        }
        Optional<Order> orderOpt = getOrderUseCase.getById(orderId);
        if (orderOpt.isEmpty()) {
            throw new IllegalArgumentException("주문을 찾을 수 없습니다.");
        }
        long expectedAmount = orderOpt.get().getTotalAmount();

        String token = getToken();
        Map<String, Object> payment = getPayment(impUid, token);
        if (payment == null) {
            throw new IllegalStateException("결제 정보를 확인할 수 없습니다.");
        }
        Object statusObj = payment.get("status");
        String status = statusObj != null ? statusObj.toString() : "";
        if (!"paid".equalsIgnoreCase(status)) {
            throw new IllegalStateException("결제가 완료되지 않았습니다. status=" + status);
        }
        Object amountObj = payment.get("amount");
        long actualAmount = amountObj instanceof Number ? ((Number) amountObj).longValue() : Long.parseLong(String.valueOf(amountObj));
        if (actualAmount != expectedAmount) {
            throw new IllegalStateException("결제 금액이 일치하지 않습니다. expected=" + expectedAmount + ", actual=" + actualAmount);
        }
    }

    @SuppressWarnings("unchecked")
    private String getToken() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, String> body = Map.of("imp_key", apiKey, "imp_secret", apiSecret);
        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> res = restTemplate.postForEntity(TOKEN_URL, request, Map.class);
        if (res.getBody() == null) {
            throw new IllegalStateException("포트원 토큰 발급 실패");
        }
        Object response = res.getBody().get("response");
        if (response instanceof Map) {
            Object accessToken = ((Map<?, ?>) response).get("access_token");
            if (accessToken != null) {
                return accessToken.toString();
            }
        }
        throw new IllegalStateException("포트원 토큰 발급 응답 형식 오류");
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getPayment(String impUid, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> res = restTemplate.exchange(PAYMENTS_URL + impUid, HttpMethod.GET, entity, Map.class);
        if (res.getBody() == null) {
            return null;
        }
        Object response = res.getBody().get("response");
        if (response instanceof Map) {
            return (Map<String, Object>) response;
        }
        return null;
    }
}
