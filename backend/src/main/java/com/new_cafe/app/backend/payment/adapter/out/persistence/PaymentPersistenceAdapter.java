package com.new_cafe.app.backend.payment.adapter.out.persistence;

import com.new_cafe.app.backend.payment.application.port.out.PaymentRepositoryPort;
import com.new_cafe.app.backend.payment.adapter.out.jpa.PaymentEntity;
import com.new_cafe.app.backend.payment.adapter.out.jpa.PaymentJpaRepository;
import com.new_cafe.app.backend.payment.model.Payment;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class PaymentPersistenceAdapter implements PaymentRepositoryPort {

    private final PaymentJpaRepository paymentJpaRepository;

    public PaymentPersistenceAdapter(PaymentJpaRepository paymentJpaRepository) {
        this.paymentJpaRepository = paymentJpaRepository;
    }

    @Override
    public Payment save(Payment payment) {
        PaymentEntity entity = toEntity(payment);
        PaymentEntity saved = paymentJpaRepository.save(entity);
        return toModel(saved);
    }

    @Override
    public Optional<Payment> findFirstByOrderIdOrderByCreatedAtDesc(Long orderId) {
        return paymentJpaRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId).map(this::toModel);
    }

    private Payment toModel(PaymentEntity e) {
        return Payment.builder()
                .id(e.getId())
                .orderId(e.getOrderId())
                .method(e.getMethod())
                .status(e.getStatus())
                .pgTid(e.getPgTid())
                .amount(e.getAmount())
                .paidAt(e.getPaidAt())
                .createdAt(e.getCreatedAt())
                .build();
    }

    private PaymentEntity toEntity(Payment m) {
        return PaymentEntity.builder()
                .id(m.getId())
                .orderId(m.getOrderId())
                .method(m.getMethod() != null ? m.getMethod() : "TOSS")
                .status(m.getStatus() != null ? m.getStatus() : "PENDING")
                .pgTid(m.getPgTid())
                .amount(m.getAmount() != null ? m.getAmount() : 0)
                .paidAt(m.getPaidAt())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
