package com.new_cafe.app.backend.payment.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentJpaRepository extends JpaRepository<PaymentEntity, Long> {
    List<PaymentEntity> findByOrderId(Long orderId);
    Optional<PaymentEntity> findFirstByOrderIdOrderByCreatedAtDesc(Long orderId);
}
