package com.new_cafe.app.backend.order.adapter.out.persistence;

import com.new_cafe.app.backend.order.application.port.out.OrderRepositoryPort;
import com.new_cafe.app.backend.order.model.Order;
import com.new_cafe.app.backend.order.model.OrderItem;
import com.new_cafe.app.backend.order.adapter.out.jpa.OrderEntity;
import com.new_cafe.app.backend.order.adapter.out.jpa.OrderItemEntity;
import com.new_cafe.app.backend.order.adapter.out.jpa.OrderJpaRepository;
import com.new_cafe.app.backend.order.adapter.out.jpa.OrderItemJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Repository
public class OrderPersistenceAdapter implements OrderRepositoryPort {

    private final OrderJpaRepository orderJpaRepository;
    private final OrderItemJpaRepository orderItemJpaRepository;

    public OrderPersistenceAdapter(OrderJpaRepository orderJpaRepository,
                                   OrderItemJpaRepository orderItemJpaRepository) {
        this.orderJpaRepository = orderJpaRepository;
        this.orderItemJpaRepository = orderItemJpaRepository;
    }

    @Override
    @Transactional
    public Order save(Order order) {
        LocalDateTime now = LocalDateTime.now();
        OrderEntity entity;
        if (order.getId() == null) {
            String orderNumber = "ORD-" + now.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + "-" + String.format("%04d", ThreadLocalRandom.current().nextInt(10_000));
            int amount = order.getTotalAmount() != null ? order.getTotalAmount() : 0;
            String orderType = order.getType() != null ? order.getType() : "PICK_UP";
            entity = OrderEntity.builder()
                .orderNumber(orderNumber)
                .userId(order.getUserId())
                .customerId(order.getUserId())
                .guestEmail(order.getGuestEmail())
                .guestPhone(order.getGuestPhone())
                .type(orderType)
                .status(order.getStatus())
                .totalAmount(amount)
                .totalPrice(amount)
                .createdAt(now)
                .updatedAt(now)
                .build();
            entity = orderJpaRepository.save(entity);
            order.setId(entity.getId());
            order.setOrderNumber(entity.getOrderNumber());
            order.setCustomerId(entity.getCustomerId());
            order.setTotalPrice(entity.getTotalPrice());
            order.setCreatedAt(now);
            order.setUpdatedAt(now);
            for (OrderItem item : order.getItems()) {
                OrderItemEntity ie = toItemEntity(item, entity);
                ie = orderItemJpaRepository.save(ie);
                item.setId(ie.getId());
                item.setOrderId(entity.getId());
            }
        } else {
            entity = orderJpaRepository.findById(order.getId()).orElseThrow();
            entity.setStatus(order.getStatus());
            if (order.getType() != null) entity.setType(order.getType());
            Integer amount = order.getTotalAmount() != null ? order.getTotalAmount() : 0;
            entity.setTotalAmount(amount);
            entity.setTotalPrice(amount);
            entity.setAppliedUserCouponId(order.getAppliedUserCouponId());
            if (order.getPaymentId() != null) entity.setPaymentId(order.getPaymentId());
            entity.setUpdatedAt(now);
            orderJpaRepository.save(entity);
            order.setUpdatedAt(now);
        }
        return order;
    }

    private OrderItemEntity toItemEntity(OrderItem item, OrderEntity order) {
        return OrderItemEntity.builder()
            .order(order)
            .menuId(item.getMenuId())
            .menuName(item.getMenuName())
            .quantity(item.getQuantity())
            .unitPrice(item.getUnitPrice())
            .optionExtraPrice(item.getOptionExtraPrice() != null ? item.getOptionExtraPrice() : 0)
            .optionsDisplay(item.getOptionsDisplay())
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Order> findById(Long id) {
        return orderJpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> findByUserIdOrderByCreatedAtDesc(Long userId) {
        return orderJpaRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(this::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Order> findAllOrderByCreatedAtDesc(Pageable pageable) {
        return orderJpaRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Order> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable) {
        return orderJpaRepository.findByStatusOrderByCreatedAtDesc(status, pageable).map(this::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Order> findByStatusAndCreatedAtBetweenOrderByCreatedAtDesc(
            String status, LocalDateTime from, LocalDateTime to, Pageable pageable) {
        return orderJpaRepository.findByStatusAndCreatedAtBetweenOrderByCreatedAtDesc(status, from, to, pageable)
            .map(this::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime from, LocalDateTime to, Pageable pageable) {
        return orderJpaRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(from, to, pageable).map(this::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public long countByStatus(String status) {
        return orderJpaRepository.countByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to) {
        return orderJpaRepository.countByCreatedAtBetween(from, to);
    }

    @Override
    @Transactional(readOnly = true)
    public long sumTotalAmountByCreatedAtBetween(LocalDateTime from, LocalDateTime to) {
        return orderJpaRepository.sumTotalAmountByCreatedAtBetween(from, to);
    }

    private Order toDomain(OrderEntity e) {
        List<OrderItem> items = orderItemJpaRepository.findByOrderId(e.getId()).stream()
            .map(oi -> OrderItem.builder()
                .id(oi.getId())
                .orderId(e.getId())
                .menuId(oi.getMenuId())
                .menuName(oi.getMenuName())
                .quantity(oi.getQuantity())
                .unitPrice(oi.getUnitPrice())
                .optionExtraPrice(oi.getOptionExtraPrice())
                .optionsDisplay(oi.getOptionsDisplay())
                .build())
            .collect(Collectors.toList());
        return Order.builder()
            .id(e.getId())
            .orderNumber(e.getOrderNumber())
            .userId(e.getUserId())
            .customerId(e.getCustomerId())
            .guestEmail(e.getGuestEmail())
            .guestPhone(e.getGuestPhone())
            .type(e.getType() != null ? e.getType() : "PICK_UP")
            .status(e.getStatus())
            .totalAmount(e.getTotalAmount())
            .totalPrice(e.getTotalPrice())
            .appliedUserCouponId(e.getAppliedUserCouponId())
            .paymentId(e.getPaymentId())
            .items(items)
            .createdAt(e.getCreatedAt())
            .updatedAt(e.getUpdatedAt())
            .build();
    }
}
