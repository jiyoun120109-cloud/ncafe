package com.new_cafe.app.backend.coupon.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserCouponJpaRepository extends JpaRepository<UserCouponEntity, Long> {
    List<UserCouponEntity> findByUserIdOrderByIssuedAtDesc(Long userId);
}
