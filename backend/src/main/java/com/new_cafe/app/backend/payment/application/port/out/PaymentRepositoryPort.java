package com.new_cafe.app.backend.payment.application.port.out;

import com.new_cafe.app.backend.payment.model.Payment;

import java.util.Optional;

public interface PaymentRepositoryPort {

    Payment save(Payment payment);

    Optional<Payment> findFirstByOrderIdOrderByCreatedAtDesc(Long orderId);
}
