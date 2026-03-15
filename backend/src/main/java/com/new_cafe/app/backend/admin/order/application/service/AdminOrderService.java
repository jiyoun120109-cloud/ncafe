package com.new_cafe.app.backend.admin.order.application.service;

import com.new_cafe.app.backend.admin.order.application.port.in.AdminOrderUseCase;
import com.new_cafe.app.backend.menu.application.port.out.MenuRepositoryPort;
import com.new_cafe.app.backend.menu.model.Menu;
import com.new_cafe.app.backend.order.application.port.out.OrderRepositoryPort;
import com.new_cafe.app.backend.order.model.Order;
import com.new_cafe.app.backend.order.model.OrderItem;
import com.new_cafe.app.backend.visitor.adapter.out.jpa.VisitorLogJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminOrderService implements AdminOrderUseCase {

    private final OrderRepositoryPort orderRepositoryPort;
    private final VisitorLogJpaRepository visitorLogJpaRepository;
    private final MenuRepositoryPort menuRepositoryPort;

    public AdminOrderService(OrderRepositoryPort orderRepositoryPort,
                             VisitorLogJpaRepository visitorLogJpaRepository,
                             MenuRepositoryPort menuRepositoryPort) {
        this.orderRepositoryPort = orderRepositoryPort;
        this.visitorLogJpaRepository = visitorLogJpaRepository;
        this.menuRepositoryPort = menuRepositoryPort;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Order> getOrderList(Pageable pageable, String search, String status, LocalDate fromDate, LocalDate toDate) {
        LocalDateTime from = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime to = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

        if (search != null && !search.isBlank()) {
            return orderRepositoryPort.findOrdersForAdmin(search, status, from, to, pageable);
        }
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
    public Map<String, Object> getOrderListSummary(String status, LocalDate fromDate, LocalDate toDate) {
        LocalDateTime from = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime to = toDate != null ? toDate.atTime(LocalTime.MAX) : null;
        long totalCount;
        long totalRevenue;
        if (status != null && !status.isBlank()) {
            if (from != null && to != null) {
                totalCount = orderRepositoryPort.countByStatusAndCreatedAtBetween(status, from, to);
                totalRevenue = orderRepositoryPort.sumTotalAmountByStatusAndCreatedAtBetween(status, from, to);
            } else {
                totalCount = orderRepositoryPort.countByStatus(status);
                totalRevenue = orderRepositoryPort.sumTotalAmountByStatus(status);
            }
        } else if (from != null && to != null) {
            totalCount = orderRepositoryPort.countByCreatedAtBetween(from, to);
            totalRevenue = orderRepositoryPort.sumTotalAmountByCreatedAtBetween(from, to);
        } else {
            totalCount = 0;
            totalRevenue = 0;
        }
        Map<String, Object> result = new HashMap<>();
        result.put("totalCount", totalCount);
        result.put("totalRevenue", totalRevenue);
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Order> getOrderById(Long id) {
        return orderRepositoryPort.findById(id);
    }

    @Override
    @Transactional
    public void deleteOrder(Long id) {
        if (orderRepositoryPort.findById(id).isEmpty()) {
            throw new IllegalArgumentException("주문을 찾을 수 없습니다.");
        }
        orderRepositoryPort.deleteById(id);
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
        long revenueToday = orderRepositoryPort.sumTotalAmountByStatusAndCreatedAtBetween("PAID", from, to);

        LocalDate yesterday = target.minusDays(1);
        long ordersYesterday = orderRepositoryPort.countByCreatedAtBetween(
                yesterday.atStartOfDay(), yesterday.atTime(LocalTime.MAX));
        long revenueYesterday = orderRepositoryPort.sumTotalAmountByStatusAndCreatedAtBetween("PAID",
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
                long revenue = orderRepositoryPort.sumTotalAmountByStatusAndCreatedAtBetween("PAID", from, to);
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
                long revenue = orderRepositoryPort.sumTotalAmountByStatusAndCreatedAtBetween("PAID", from, to);
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
                long revenue = orderRepositoryPort.sumTotalAmountByStatusAndCreatedAtBetween("PAID", from, to);
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

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getTodayRevenueBreakdown(LocalDate date) {
        LocalDate target = date != null ? date : LocalDate.now();
        LocalDateTime from = target.atStartOfDay();
        LocalDateTime to = target.plusDays(1).atStartOfDay();

        Map<String, int[]> byProduct = new HashMap<>();
        Map<String, int[]> byCategory = new HashMap<>();
        int totalCount = 0;
        long totalRevenue = 0L;

        int page = 0;
        int size = 100;
        Page<Order> orderPage;
        do {
            Pageable pageable = PageRequest.of(page, size);
            orderPage = orderRepositoryPort.findByStatusAndCreatedAtBetweenOrderByCreatedAtDesc("PAID", from, to, pageable);
            for (Order order : orderPage.getContent()) {
                totalRevenue += (order.getTotalAmount() != null ? order.getTotalAmount() : 0);
                if (order.getItems() == null) continue;
                for (OrderItem item : order.getItems()) {
                    int qty = item.getQuantity() != null ? item.getQuantity() : 0;
                    int unitPrice = item.getUnitPrice() != null ? item.getUnitPrice() : 0;
                    int extra = item.getOptionExtraPrice() != null ? item.getOptionExtraPrice() : 0;
                    long lineRevenue = (long) qty * unitPrice + extra;
                    String menuName = item.getMenuName() != null ? item.getMenuName() : "미상";
                    Long menuId = item.getMenuId();

                    byProduct.computeIfAbsent(menuName, k -> new int[]{0, 0})[0] += qty;
                    byProduct.get(menuName)[1] += (int) lineRevenue;

                    String categoryName = "미분류";
                    if (menuId != null) {
                        Menu menu = menuRepositoryPort.findById(menuId);
                        if (menu != null && menu.getCategory() != null && menu.getCategory().getName() != null) {
                            categoryName = menu.getCategory().getName();
                        }
                    }
                    byCategory.computeIfAbsent(categoryName, k -> new int[]{0, 0})[0] += qty;
                    byCategory.get(categoryName)[1] += (int) lineRevenue;

                    totalCount += qty;
                }
            }
            page++;
        } while (orderPage.hasNext());

        List<Map<String, Object>> byProductList = byProduct.entrySet().stream()
                .sorted(Comparator.<Map.Entry<String, int[]>>comparingInt(e -> e.getValue()[1]).reversed())
                .map(e -> Map.<String, Object>of(
                        "menuName", e.getKey(),
                        "count", e.getValue()[0],
                        "revenue", e.getValue()[1]))
                .collect(Collectors.toList());
        List<Map<String, Object>> byCategoryList = byCategory.entrySet().stream()
                .sorted(Comparator.<Map.Entry<String, int[]>>comparingInt(e -> e.getValue()[1]).reversed())
                .map(e -> Map.<String, Object>of(
                        "categoryName", e.getKey(),
                        "count", e.getValue()[0],
                        "revenue", e.getValue()[1]))
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("byProduct", byProductList);
        result.put("byCategory", byCategoryList);
        result.put("totalCount", totalCount);
        result.put("totalRevenue", totalRevenue);
        return result;
    }
}
