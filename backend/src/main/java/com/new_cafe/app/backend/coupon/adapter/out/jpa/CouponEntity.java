package com.new_cafe.app.backend.coupon.adapter.out.jpa;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "coupon_type", nullable = false, length = 50)
    @Builder.Default
    private String couponType = "STAMP_REWARD";

    @Column(name = "required_stamps")
    @Builder.Default
    private Integer requiredStamps = 10;

    @Column(name = "menu_id")
    private Long menuId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /** 스탬프 리워드 쿠폰 템플릿은 미사용(false). user_coupons에서 사용 여부 관리 */
    @Column(name = "is_used", nullable = false)
    @Builder.Default
    private Boolean isUsed = false;
}
