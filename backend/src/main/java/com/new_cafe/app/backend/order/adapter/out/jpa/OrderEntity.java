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

    /** 주문 번호 (노출용, 예: ORD-20260315135256-1234). DB에 order_number NOT NULL 컬럼이 있으면 필수 */
    @Column(name = "order_number", length = 64)
    private String orderNumber;

    @Column(name = "user_id")
    private Long userId;

    /** 배포 DB에 customer_id NOT NULL 컬럼이 있는 경우: user_id와 동일 값으로 저장 (회원 주문), 비회원은 null → 마이그레이션으로 nullable 처리 */
    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "guest_email")
    private String guestEmail;

    @Column(name = "guest_phone", length = 50)
    private String guestPhone;

    /** 주문 유형 (배포 DB에 type NOT NULL 컬럼이 있는 경우: GENERAL 등) */
    @Column(name = "type", nullable = false, length = 50)
    @Builder.Default
    private String type = "GENERAL";

    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "total_amount", nullable = false)
    @Builder.Default
    private Integer totalAmount = 0;

    /** 배포 DB에 total_price NOT NULL 컬럼이 있는 경우: total_amount와 동일 값으로 저장 */
    @Column(name = "total_price")
    private Integer totalPrice;

    @Column(name = "applied_user_coupon_id")
    private Long appliedUserCouponId;

    /** 배포 DB에 payment_id 컬럼이 있는 경우. 주문 생성 시 null, 결제 준비(ready) 시 payments.id로 갱신 */
    @Column(name = "payment_id")
    private Long paymentId;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItemEntity> items = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
