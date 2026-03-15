package com.new_cafe.app.backend.order.model;

import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    private Long id;
    /** 노출용 주문 번호 (예: ORD-20260315135256-1234) */
    private String orderNumber;
    private Long userId;
    /** 회원 주문 시 user_id와 동일 (customer_id 컬럼) */
    private Long customerId;
    private String guestEmail;
    private String guestPhone;
    /** 주문 유형: PICK_UP, DINE_IN, DELIVERY 등 */
    @Builder.Default
    private String type = "PICK_UP";
    @Builder.Default
    private String status = "PENDING";
    @Builder.Default
    private Integer totalAmount = 0;
    /** 결제 금액 (total_amount와 동일하게 저장) */
    private Integer totalPrice;
    /** 결제 시 적용한 보유 쿠폰 ID (user_coupons.id) */
    private Long appliedUserCouponId;
    /** 결제 준비 시 생성된 payments.id */
    private Long paymentId;
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
