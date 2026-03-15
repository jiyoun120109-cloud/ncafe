package com.new_cafe.app.backend.order.application.service;

import com.new_cafe.app.backend.order.application.port.in.CancelOrderUseCase;
import com.new_cafe.app.backend.order.application.port.in.GetOrderUseCase;
import com.new_cafe.app.backend.order.application.port.out.OrderRepositoryPort;
import com.new_cafe.app.backend.order.model.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CancelOrderService implements CancelOrderUseCase {

    private final GetOrderUseCase getOrderUseCase;
    private final OrderRepositoryPort orderRepositoryPort;

    public CancelOrderService(GetOrderUseCase getOrderUseCase, OrderRepositoryPort orderRepositoryPort) {
        this.getOrderUseCase = getOrderUseCase;
        this.orderRepositoryPort = orderRepositoryPort;
    }

    @Override
    @Transactional
    public Order cancel(Long orderId, Long userId) {
        Order order = getOrderUseCase.getById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));
        if (order.getUserId() == null || !order.getUserId().equals(userId)) {
            throw new IllegalArgumentException("본인의 주문만 취소할 수 있습니다.");
        }
        if ("CANCELLED".equals(order.getStatus())) {
            throw new IllegalArgumentException("이미 취소된 주문입니다.");
        }
        order.setStatus("CANCELLED");
        return orderRepositoryPort.save(order);
    }
}
