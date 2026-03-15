package com.new_cafe.app.backend.order.application.service;

import com.new_cafe.app.backend.auth.application.port.out.MemberRepositoryPort;
import com.new_cafe.app.backend.menu.application.port.out.MenuRepositoryPort;
import com.new_cafe.app.backend.order.application.command.CreateOrderCommand;
import com.new_cafe.app.backend.order.application.port.in.CreateOrderUseCase;
import com.new_cafe.app.backend.order.application.port.out.OrderRepositoryPort;
import com.new_cafe.app.backend.order.application.result.CreateOrderResult;
import com.new_cafe.app.backend.order.model.Order;
import com.new_cafe.app.backend.order.model.OrderItem;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService implements CreateOrderUseCase {

    private final OrderRepositoryPort orderRepositoryPort;
    private final MemberRepositoryPort memberRepositoryPort;
    private final MenuRepositoryPort menuRepositoryPort;

    public OrderService(OrderRepositoryPort orderRepositoryPort, MemberRepositoryPort memberRepositoryPort,
                        MenuRepositoryPort menuRepositoryPort) {
        this.orderRepositoryPort = orderRepositoryPort;
        this.memberRepositoryPort = memberRepositoryPort;
        this.menuRepositoryPort = menuRepositoryPort;
    }

    @Override
    @Transactional
    public CreateOrderResult createOrder(CreateOrderCommand command) {
        if (command.getItems() == null || command.getItems().isEmpty()) {
            throw new IllegalArgumentException("주문 항목이 없습니다.");
        }
        if (command.getUserId() != null && memberRepositoryPort.findById(command.getUserId()).isEmpty()) {
            throw new IllegalArgumentException("회원 정보를 찾을 수 없습니다. 다시 로그인한 뒤 주문해 주세요.");
        }
        for (CreateOrderCommand.OrderItemDto dto : command.getItems()) {
            if (menuRepositoryPort.findById(dto.getMenuId()) == null) {
                throw new IllegalArgumentException("주문에 포함된 메뉴를 찾을 수 없습니다. 장바구니를 비운 뒤 다시 시도해 주세요.");
            }
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
