package com.new_cafe.app.backend.order.application.service;

import com.new_cafe.app.backend.order.application.port.in.GetOrderUseCase;
import com.new_cafe.app.backend.order.application.port.out.OrderRepositoryPort;
import com.new_cafe.app.backend.order.model.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class OrderQueryService implements GetOrderUseCase {

    private final OrderRepositoryPort orderRepositoryPort;

    public OrderQueryService(OrderRepositoryPort orderRepositoryPort) {
        this.orderRepositoryPort = orderRepositoryPort;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Order> getById(Long orderId) {
        return orderRepositoryPort.findById(orderId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getByUserId(Long userId) {
        return orderRepositoryPort.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
