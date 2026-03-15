package com.new_cafe.app.backend.order.application.port.out;

import com.new_cafe.app.backend.order.model.Order;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderRepositoryPort {
    Order save(Order order);
    Optional<Order> findById(Long id);
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<Order> findAllOrderByCreatedAtDesc(Pageable pageable);
    Page<Order> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    Page<Order> findByStatusAndCreatedAtBetweenOrderByCreatedAtDesc(
            String status, LocalDateTime from, LocalDateTime to, Pageable pageable);
    Page<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime from, LocalDateTime to, Pageable pageable);

    /** Admin list with optional search (orderNumber, guestEmail, guestPhone), status, date range */
    Page<Order> findOrdersForAdmin(String search, String status, LocalDateTime from, LocalDateTime to, Pageable pageable);

    long countByStatus(String status);
    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);
    long countByStatusAndCreatedAtBetween(String status, LocalDateTime from, LocalDateTime to);
    long sumTotalAmountByCreatedAtBetween(LocalDateTime from, LocalDateTime to);
    long sumTotalAmountByStatusAndCreatedAtBetween(String status, LocalDateTime from, LocalDateTime to);
    void deleteById(Long id);
}
