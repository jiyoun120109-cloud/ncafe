package com.new_cafe.app.backend.cart.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartJpaRepository extends JpaRepository<CartEntity, Long> {
    Optional<CartEntity> findByGuestSessionId(String guestSessionId);
    Optional<CartEntity> findByUserId(Long userId);
}
