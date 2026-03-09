package com.new_cafe.app.backend.cart.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemJpaRepository extends JpaRepository<CartItemEntity, Long> {
}
