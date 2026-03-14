package com.new_cafe.app.backend.admin.order.application.port.in;

import com.new_cafe.app.backend.order.model.Order;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminOrderUseCase {

    Page<Order> getOrderList(Pageable pageable, String status, LocalDate fromDate, LocalDate toDate);

    Optional<Order> getOrderById(Long id);

    Order updateOrderStatus(Long orderId, String status);

    Order cancelOrder(Long orderId);

    Map<String, Object> getOrderStats(LocalDate date);

    /**
     * @param period "day", "week", or "month"
     * @return list of { label, orderCount, revenue } for chart
     */
    List<Map<String, Object>> getOrderStatsByPeriod(String period);
}
