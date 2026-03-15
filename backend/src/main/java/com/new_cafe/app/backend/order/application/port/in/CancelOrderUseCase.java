package com.new_cafe.app.backend.order.application.port.in;

import com.new_cafe.app.backend.order.model.Order;

/**
 * 회원 본인 주문 취소 (상태를 CANCELLED로 변경).
 */
public interface CancelOrderUseCase {
    /**
     * @param orderId 주문 ID
     * @param userId 요청한 회원 ID (본인 주문만 취소 가능)
     * @return 취소된 주문
     * @throws IllegalArgumentException 주문 없음, 본인 주문 아님, 이미 취소됨
     */
    Order cancel(Long orderId, Long userId);
}
