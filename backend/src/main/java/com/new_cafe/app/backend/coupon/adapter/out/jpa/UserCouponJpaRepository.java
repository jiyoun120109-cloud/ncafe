package com.new_cafe.app.backend.coupon.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import java.util.Optional;

public interface UserCouponJpaRepository extends JpaRepository<UserCouponEntity, Long> {
    List<UserCouponEntity> findByUserIdOrderByIssuedAtDesc(Long userId);
    Optional<UserCouponEntity> findByUserIdAndCouponId(Long userId, Long couponId);
}
