package com.new_cafe.app.backend.order.adapter.out.jpa;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    /** 배포 DB에 customer_id NOT NULL 컬럼이 있는 경우: user_id와 동일 값으로 저장 (회원 주문), 비회원은 null → 마이그레이션으로 nullable 처리 */
    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "guest_email")
    private String guestEmail;

    @Column(name = "guest_phone", length = 50)
    private String guestPhone;

    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "total_amount", nullable = false)
    @Builder.Default
    private Integer totalAmount = 0;

    @Column(name = "applied_user_coupon_id")
    private Long appliedUserCouponId;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItemEntity> items = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
