package com.new_cafe.app.backend.coupon.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserStampJpaRepository extends JpaRepository<UserStampEntity, Long> {
    Optional<UserStampEntity> findByUserId(Long userId);
}
