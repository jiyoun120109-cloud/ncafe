package com.new_cafe.app.backend.order.adapter.in.web;

import com.new_cafe.app.backend.order.application.command.CreateOrderCommand;
import com.new_cafe.app.backend.order.application.port.in.CreateOrderUseCase;
import com.new_cafe.app.backend.order.application.port.in.GetOrderUseCase;
import com.new_cafe.app.backend.order.application.result.CreateOrderResult;
import com.new_cafe.app.backend.order.model.Order;
import com.new_cafe.app.backend.order.adapter.in.web.dto.CreateOrderRequestDto;
import com.new_cafe.app.backend.payment.application.port.in.ProcessPaymentUseCase;
import io.jsonwebtoken.Claims;
import com.new_cafe.app.backend.auth.adapter.out.jwt.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final CreateOrderUseCase createOrderUseCase;
    private final GetOrderUseCase getOrderUseCase;
    private final JwtService jwtService;
    private final ProcessPaymentUseCase processPaymentUseCase;
    private final ApplyCouponToOrderService applyCouponToOrderService;

    public OrderController(CreateOrderUseCase createOrderUseCase, GetOrderUseCase getOrderUseCase,
                          JwtService jwtService, ProcessPaymentUseCase processPaymentUseCase,
                          ApplyCouponToOrderService applyCouponToOrderService) {
        this.createOrderUseCase = createOrderUseCase;
        this.getOrderUseCase = getOrderUseCase;
        this.jwtService = jwtService;
        this.processPaymentUseCase = processPaymentUseCase;
        this.applyCouponToOrderService = applyCouponToOrderService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createOrder(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody CreateOrderRequestDto request
    ) {
        Long userId = null;
        if (authorization != null && authorization.startsWith("Bearer ")) {
            try {
                Claims claims = jwtService.parseToken(authorization);
                userId = jwtService.getUserIdFromClaims(claims);
            } catch (Exception ignored) {
                /* 토큰 만료/무효 시 userId는 null 유지 */
            }
        }
        // 로그인 주문으로 보내왔는데 JWT가 없으면 세션 만료 → 401 (guest 주문으로 저장 시 customer_id 등으로 409 나는 배포 DB 방지)
        if (request.getUserId() != null && userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized", "message", "로그인 세션이 만료되었습니다. 다시 로그인한 뒤 주문해 주세요."));
        }
        CreateOrderCommand command = CreateOrderCommand.builder()
                .userId(userId)
                .guestEmail(request.getGuestEmail())
                .guestPhone(request.getGuestPhone())
                .items(request.getItems() != null ? request.getItems().stream()
                        .map(i -> new CreateOrderCommand.OrderItemDto(
                                i.getMenuId(), i.getMenuName(), i.getQuantity(),
                                i.getUnitPrice(), i.getOptionExtraPrice(), i.getOptionsDisplay()))
                        .collect(Collectors.toList()) : List.of())
                .build();
        CreateOrderResult result = createOrderUseCase.createOrder(command);
        Map<String, Object> body = new HashMap<>();
        body.put("orderId", result.getOrderId());
        body.put("totalAmount", result.getTotalAmount());
        body.put("status", result.getStatus());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> myOrders(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        Claims claims = authorization != null && authorization.startsWith("Bearer ") ? jwtService.parseToken(authorization) : null;
        Long userId = jwtService.getUserIdFromClaims(claims);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        List<Order> orders = getOrderUseCase.getByUserId(userId);
        List<Map<String, Object>> list = orders.stream().map(this::orderToMap).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getOrder(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id
    ) {
        Optional<Order> orderOpt = getOrderUseCase.getById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Order order = orderOpt.get();
        if (order.getUserId() != null && authorization != null && authorization.startsWith("Bearer ")) {
            Claims claims = jwtService.parseToken(authorization);
            Long userId = jwtService.getUserIdFromClaims(claims);
            if (userId != null && !userId.equals(order.getUserId())) {
                return ResponseEntity.status(403).build();
            }
        }
        return ResponseEntity.ok(orderToMap(order));
    }

    @PostMapping("/{orderId}/apply-coupon")
    public ResponseEntity<Map<String, Object>> applyCoupon(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long orderId,
            @RequestBody Map<String, Object> body
    ) {
        Claims claims = authorization != null && authorization.startsWith("Bearer ") ? jwtService.parseToken(authorization) : null;
        Long userId = jwtService.getUserIdFromClaims(claims);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        Object ucIdObj = body != null ? body.get("userCouponId") : null;
        if (ucIdObj == null) {
            return ResponseEntity.badRequest().build();
        }
        Long userCouponId = ucIdObj instanceof Number ? ((Number) ucIdObj).longValue() : Long.parseLong(ucIdObj.toString());
        try {
            Order order = applyCouponToOrderService.apply(orderId, userId, userCouponId);
            return ResponseEntity.ok(orderToMap(order));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
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
        if (order.getAppliedUserCouponId() != null) {
            m.put("appliedUserCouponId", order.getAppliedUserCouponId());
        }
        m.put("createdAt", order.getCreatedAt());
        m.put("items", order.getItems().stream().map(item -> {
            Map<String, Object> im = new HashMap<>();
            im.put("id", item.getId());
            im.put("menuId", item.getMenuId());
            im.put("menuName", item.getMenuName());
            im.put("quantity", item.getQuantity());
            im.put("unitPrice", item.getUnitPrice());
            im.put("optionExtraPrice", item.getOptionExtraPrice());
            im.put("optionsDisplay", item.getOptionsDisplay());
            return im;
        }).collect(Collectors.toList()));
        return m;
    }

    @PostMapping("/{orderId}/payments/ready")
    public ResponseEntity<Map<String, Object>> paymentReady(
            @PathVariable Long orderId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String method = body != null && body.containsKey("method") ? body.get("method") : "KAKAOPAY";
        Map<String, Object> result = processPaymentUseCase.ready(orderId, method);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{orderId}/payments/complete")
    public ResponseEntity<Void> paymentComplete(
            @PathVariable Long orderId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String pgTid = body != null && body.get("pgTid") != null ? body.get("pgTid") : "";
        processPaymentUseCase.complete(orderId, pgTid);
        return ResponseEntity.ok().build();
    }
}
