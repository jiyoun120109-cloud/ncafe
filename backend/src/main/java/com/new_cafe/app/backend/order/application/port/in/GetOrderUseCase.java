package com.new_cafe.app.backend.order.application.port.in;

import com.new_cafe.app.backend.order.domain.model.Order;

import java.util.List;
import java.util.Optional;

public interface GetOrderUseCase {
    Optional<Order> getById(Long orderId);
    List<Order> getByUserId(Long userId);
}
