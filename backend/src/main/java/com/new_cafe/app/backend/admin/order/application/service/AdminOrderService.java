package com.new_cafe.app.backend.admin.order.application.service;

import com.new_cafe.app.backend.admin.order.application.port.in.AdminOrderUseCase;
import com.new_cafe.app.backend.order.application.port.out.OrderRepositoryPort;
import com.new_cafe.app.backend.order.model.Order;
import com.new_cafe.app.backend.visitor.adapter.out.jpa.VisitorLogJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminOrderService implements AdminOrderUseCase {

    private final OrderRepositoryPort orderRepositoryPort;
    private final VisitorLogJpaRepository visitorLogJpaRepository;

    public AdminOrderService(OrderRepositoryPort orderRepositoryPort,
                             VisitorLogJpaRepository visitorLogJpaRepository) {
        this.orderRepositoryPort = orderRepositoryPort;
        this.visitorLogJpaRepository = visitorLogJpaRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Order> getOrderList(Pageable pageable, String status, LocalDate fromDate, LocalDate toDate) {
        LocalDateTime from = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime to = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

        if (status != null && !status.isBlank()) {
            if (from != null && to != null) {
                return orderRepositoryPort.findByStatusAndCreatedAtBetweenOrderByCreatedAtDesc(status, from, to, pageable);
            }
            return orderRepositoryPort.findByStatusOrderByCreatedAtDesc(status, pageable);
        }
        if (from != null && to != null) {
            return orderRepositoryPort.findByCreatedAtBetweenOrderByCreatedAtDesc(from, to, pageable);
        }
        return orderRepositoryPort.findAllOrderByCreatedAtDesc(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Order> getOrderById(Long id) {
        return orderRepositoryPort.findById(id);
    }

    @Override
    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepositoryPort.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));
        if ("CANCELLED".equals(order.getStatus())) {
            throw new IllegalArgumentException("취소된 주문은 상태를 변경할 수 없습니다.");
        }
        order.setStatus(status != null ? status.toUpperCase() : order.getStatus());
        return orderRepositoryPort.save(order);
    }

    @Override
    @Transactional
    public Order cancelOrder(Long orderId) {
        return updateOrderStatus(orderId, "CANCELLED");
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getOrderStats(LocalDate date) {
        LocalDate target = date != null ? date : LocalDate.now();
        LocalDateTime from = target.atStartOfDay();
        LocalDateTime to = target.atTime(LocalTime.MAX);

        long ordersToday = orderRepositoryPort.countByCreatedAtBetween(from, to);
        long revenueToday = orderRepositoryPort.sumTotalAmountByCreatedAtBetween(from, to);

        LocalDate yesterday = target.minusDays(1);
        long ordersYesterday = orderRepositoryPort.countByCreatedAtBetween(
                yesterday.atStartOfDay(), yesterday.atTime(LocalTime.MAX));
        long revenueYesterday = orderRepositoryPort.sumTotalAmountByCreatedAtBetween(
                yesterday.atStartOfDay(), yesterday.atTime(LocalTime.MAX));

        long pendingCount = orderRepositoryPort.countByStatus("PENDING");
        long paidCount = orderRepositoryPort.countByStatus("PAID");
        long cancelledCount = orderRepositoryPort.countByStatus("CANCELLED");

        Map<String, Object> result = new HashMap<>();
        result.put("ordersToday", ordersToday);
        result.put("revenueToday", revenueToday);
        result.put("ordersYesterday", ordersYesterday);
        result.put("revenueYesterday", revenueYesterday);
        result.put("pendingCount", pendingCount);
        result.put("paidCount", paidCount);
        result.put("cancelledCount", cancelledCount);
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getOrderStatsByPeriod(String period) {
        LocalDate today = LocalDate.now();
        List<Map<String, Object>> result = new ArrayList<>();

        if ("week".equalsIgnoreCase(period)) {
            // Last 4 weeks: each point = 7 days
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("M/d");
            for (int i = 3; i >= 0; i--) {
                LocalDate weekStart = today.minusDays(7 * (4 - i));
                LocalDate weekEndExclusive = today.minusDays(7 * (3 - i));
                LocalDateTime from = weekStart.atStartOfDay();
                LocalDateTime to = (i == 3 ? today.plusDays(1) : weekEndExclusive).atStartOfDay();
                long orderCount = orderRepositoryPort.countByCreatedAtBetween(from, to);
                long revenue = orderRepositoryPort.sumTotalAmountByCreatedAtBetween(from, to);
                long visitorCount = visitorLogJpaRepository.countByVisitedAtBetween(from, to);
                Map<String, Object> point = new HashMap<>();
                point.put("label", weekStart.format(fmt) + "~" + (i == 3 ? today : weekEndExclusive.minusDays(1)).format(fmt));
                point.put("orderCount", orderCount);
                point.put("revenue", revenue);
                point.put("visitorCount", visitorCount);
                result.add(point);
            }
        } else if ("month".equalsIgnoreCase(period)) {
            // Last 12 months: each point = first day of month
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy/M");
            for (int i = 11; i >= 0; i--) {
                LocalDate monthStart = today.withDayOfMonth(1).minusMonths(i);
                LocalDateTime from = monthStart.atStartOfDay();
                LocalDateTime to = monthStart.plusMonths(1).atStartOfDay();
                long orderCount = orderRepositoryPort.countByCreatedAtBetween(from, to);
                long revenue = orderRepositoryPort.sumTotalAmountByCreatedAtBetween(from, to);
                long visitorCount = visitorLogJpaRepository.countByVisitedAtBetween(from, to);
                Map<String, Object> point = new HashMap<>();
                point.put("label", monthStart.format(fmt));
                point.put("orderCount", orderCount);
                point.put("revenue", revenue);
                point.put("visitorCount", visitorCount);
                result.add(point);
            }
        } else {
            // day: last 7 days
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("M/d");
            for (int i = 6; i >= 0; i--) {
                LocalDate day = today.minusDays(i);
                LocalDateTime from = day.atStartOfDay();
                LocalDateTime to = day.plusDays(1).atStartOfDay();
                long orderCount = orderRepositoryPort.countByCreatedAtBetween(from, to);
                long revenue = orderRepositoryPort.sumTotalAmountByCreatedAtBetween(from, to);
                long visitorCount = visitorLogJpaRepository.countByVisitedAtBetween(from, to);
                Map<String, Object> point = new HashMap<>();
                point.put("label", day.format(fmt));
                point.put("orderCount", orderCount);
                point.put("revenue", revenue);
                point.put("visitorCount", visitorCount);
                result.add(point);
            }
        }
        return result;
    }
}
