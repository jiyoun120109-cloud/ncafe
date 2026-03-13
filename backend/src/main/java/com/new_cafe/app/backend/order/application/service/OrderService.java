package com.new_cafe.app.backend.order.application.service;

import com.new_cafe.app.backend.order.application.command.CreateOrderCommand;
import com.new_cafe.app.backend.order.application.port.in.CreateOrderUseCase;
import com.new_cafe.app.backend.order.application.port.out.OrderRepositoryPort;
import com.new_cafe.app.backend.order.application.result.CreateOrderResult;
import com.new_cafe.app.backend.order.domain.model.Order;
import com.new_cafe.app.backend.order.domain.model.OrderItem;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService implements CreateOrderUseCase {

    private final OrderRepositoryPort orderRepositoryPort;

    public OrderService(OrderRepositoryPort orderRepositoryPort) {
        this.orderRepositoryPort = orderRepositoryPort;
    }

    @Override
    @Transactional
    public CreateOrderResult createOrder(CreateOrderCommand command) {
        if (command.getItems() == null || command.getItems().isEmpty()) {
            throw new IllegalArgumentException("주문 항목이 없습니다.");
        }
        int total = 0;
        List<OrderItem> items = new ArrayList<>();
        for (CreateOrderCommand.OrderItemDto dto : command.getItems()) {
            int lineTotal = (dto.getUnitPrice() + (dto.getOptionExtraPrice() != null ? dto.getOptionExtraPrice() : 0)) * dto.getQuantity();
            total += lineTotal;
            items.add(OrderItem.builder()
                .menuId(dto.getMenuId())
                .menuName(dto.getMenuName())
                .quantity(dto.getQuantity())
                .unitPrice(dto.getUnitPrice())
                .optionExtraPrice(dto.getOptionExtraPrice() != null ? dto.getOptionExtraPrice() : 0)
                .optionsDisplay(dto.getOptionsDisplay())
                .build());
        }
        Order order = Order.builder()
            .userId(command.getUserId())
            .guestEmail(command.getGuestEmail())
            .guestPhone(command.getGuestPhone())
            .status("PENDING")
            .totalAmount(total)
            .items(items)
            .build();
        order = orderRepositoryPort.save(order);
        return CreateOrderResult.builder()
            .orderId(order.getId())
            .totalAmount(order.getTotalAmount())
            .status(order.getStatus())
            .build();
    }
}
