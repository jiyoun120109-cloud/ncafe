package com.new_cafe.app.backend.coupon.adapter.out.jpa;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCouponEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "coupon_id", nullable = false)
    private Long couponId;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Column(name = "issued_at")
    private LocalDateTime issuedAt;
}
