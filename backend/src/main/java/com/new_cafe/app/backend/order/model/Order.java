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
    private Long userId;
    private String guestEmail;
    private String guestPhone;
    @Builder.Default
    private String status = "PENDING";
    @Builder.Default
    private Integer totalAmount = 0;
    /** 결제 시 적용한 보유 쿠폰 ID (user_coupons.id) */
    private Long appliedUserCouponId;
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
