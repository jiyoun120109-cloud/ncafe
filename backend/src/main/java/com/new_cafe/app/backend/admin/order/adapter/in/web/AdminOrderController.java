package com.new_cafe.app.backend.admin.order.adapter.in.web;

import com.new_cafe.app.backend.admin.order.application.port.in.AdminOrderUseCase;
import com.new_cafe.app.backend.auth.adapter.out.jwt.JwtService;
import com.new_cafe.app.backend.order.model.Order;
import com.new_cafe.app.backend.order.model.OrderItem;
import io.jsonwebtoken.Claims;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final AdminOrderUseCase adminOrderUseCase;
    private final JwtService jwtService;

    public AdminOrderController(AdminOrderUseCase adminOrderUseCase, JwtService jwtService) {
        this.adminOrderUseCase = adminOrderUseCase;
        this.jwtService = jwtService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var orderPage = adminOrderUseCase.getOrderList(pageable, status, fromDate, toDate);
        List<Map<String, Object>> content = orderPage.getContent().stream()
                .map(this::orderToListMap)
                .collect(Collectors.toList());
        Map<String, Object> body = new HashMap<>();
        body.put("content", content);
        body.put("totalPages", orderPage.getTotalPages());
        body.put("totalElements", orderPage.getTotalElements());
        body.put("number", orderPage.getNumber());
        body.put("size", orderPage.getSize());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(adminOrderUseCase.getOrderStats(date));
    }

    @GetMapping("/stats/period")
    public ResponseEntity<List<Map<String, Object>>> statsPeriod(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(defaultValue = "day") String period
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(adminOrderUseCase.getOrderStatsByPeriod(period));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> get(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        return adminOrderUseCase.getOrderById(id)
                .map(order -> ResponseEntity.ok(orderToMap(order)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        String newStatus = body != null ? body.get("status") : null;
        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Order order = adminOrderUseCase.updateOrderStatus(id, newStatus);
            return ResponseEntity.ok(orderToMap(order));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancel(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        try {
            Order order = adminOrderUseCase.cancelOrder(id);
            return ResponseEntity.ok(orderToMap(order));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private boolean isAdmin(String authorization) {
        Claims claims = jwtService.parseToken(authorization);
        return claims != null && "ADMIN".equals(claims.get("role"));
    }

    private Map<String, Object> orderToListMap(Order order) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", order.getId());
        m.put("orderNumber", order.getOrderNumber());
        m.put("userId", order.getUserId());
        m.put("guestEmail", order.getGuestEmail());
        m.put("guestPhone", order.getGuestPhone());
        m.put("status", order.getStatus());
        m.put("totalAmount", order.getTotalAmount());
        m.put("totalPrice", order.getTotalPrice());
        m.put("createdAt", order.getCreatedAt());
        m.put("itemCount", order.getItems() != null ? order.getItems().size() : 0);
        return m;
    }

    private Map<String, Object> orderToMap(Order order) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", order.getId());
        m.put("orderNumber", order.getOrderNumber());
        m.put("userId", order.getUserId());
        m.put("guestEmail", order.getGuestEmail());
        m.put("guestPhone", order.getGuestPhone());
        m.put("status", order.getStatus());
        m.put("totalAmount", order.getTotalAmount());
        m.put("totalPrice", order.getTotalPrice());
        m.put("appliedUserCouponId", order.getAppliedUserCouponId());
        m.put("createdAt", order.getCreatedAt());
        m.put("updatedAt", order.getUpdatedAt());
        if (order.getItems() != null) {
            m.put("items", order.getItems().stream().map(this::itemToMap).collect(Collectors.toList()));
        }
        return m;
    }

    private Map<String, Object> itemToMap(OrderItem item) {
        Map<String, Object> im = new HashMap<>();
        im.put("id", item.getId());
        im.put("menuId", item.getMenuId());
        im.put("menuName", item.getMenuName());
        im.put("quantity", item.getQuantity());
        im.put("unitPrice", item.getUnitPrice());
        im.put("optionExtraPrice", item.getOptionExtraPrice() != null ? item.getOptionExtraPrice() : 0);
        im.put("optionsDisplay", item.getOptionsDisplay());
        return im;
    }
}
