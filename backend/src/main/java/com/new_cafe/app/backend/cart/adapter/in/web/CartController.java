package com.new_cafe.app.backend.cart.adapter.in.web;

import com.new_cafe.app.backend.auth.adapter.out.jwt.JwtService;
import com.new_cafe.app.backend.cart.application.command.*;
import com.new_cafe.app.backend.cart.application.port.in.CartUseCase;
import com.new_cafe.app.backend.cart.application.result.GetCartResult;
import com.new_cafe.app.backend.cart.adapter.in.web.dto.req.AddCartItemRequestDto;
import com.new_cafe.app.backend.cart.adapter.in.web.dto.req.UpdateCartItemRequestDto;
import com.new_cafe.app.backend.cart.adapter.in.web.dto.res.CartItemResponseDto;
import com.new_cafe.app.backend.cart.adapter.in.web.dto.res.CartResponseDto;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 장바구니 API (회원/비회원 공통)
 * 비회원: X-Cart-Session-Id 헤더로 장바구니 식별
 * 회원: Authorization Bearer JWT에서 userId 추출 → 해당 회원 장바구니 사용 (다른 사람 로그인 시 장바구니 분리)
 */
@RestController
@RequestMapping("/api/cart")
public class CartController {

    private static final String CART_SESSION_HEADER = "X-Cart-Session-Id";

    private final CartUseCase cartUseCase;
    private final JwtService jwtService;

    public CartController(CartUseCase cartUseCase, JwtService jwtService) {
        this.cartUseCase = cartUseCase;
        this.jwtService = jwtService;
    }

    private Long resolveUserId(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return null;
        try {
            Claims claims = jwtService.parseToken(authorization);
            return jwtService.getUserIdFromClaims(claims);
        } catch (Exception ignored) {
            return null;
        }
    }

    @GetMapping
    public ResponseEntity<CartResponseDto> getCart(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestHeader(value = CART_SESSION_HEADER, required = false) String guestSessionId
    ) {
        Long userId = resolveUserId(authorization);
        GetCartCommand command = GetCartCommand.builder()
            .guestSessionId(guestSessionId)
            .userId(userId)
            .build();
        GetCartResult result = cartUseCase.getCart(command);
        return ResponseEntity.ok(toResponse(result));
    }

    @PostMapping("/items")
    public ResponseEntity<Void> addItem(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestHeader(value = CART_SESSION_HEADER, required = false) String guestSessionId,
        @RequestBody AddCartItemRequestDto request
    ) {
        if (request.getMenuId() == null) {
            return ResponseEntity.badRequest().build();
        }
        Long userId = resolveUserId(authorization);
        AddCartItemCommand command = AddCartItemCommand.builder()
            .guestSessionId(guestSessionId)
            .userId(userId)
            .menuId(request.getMenuId())
            .quantity(request.getQuantity() != null ? request.getQuantity() : 1)
            .temperature(request.getTemperature())
            .beanOption(request.getBeanOption())
            .decaf(request.getDecaf())
            .build();
        cartUseCase.addItem(command);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/items/{cartItemId}")
    public ResponseEntity<Void> updateItem(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestHeader(value = CART_SESSION_HEADER, required = false) String guestSessionId,
        @PathVariable Long cartItemId,
        @RequestBody UpdateCartItemRequestDto request
    ) {
        if (request.getQuantity() == null && request.getTemperature() == null
            && request.getBeanOption() == null && request.getDecaf() == null) {
            return ResponseEntity.badRequest().build();
        }
        Long userId = resolveUserId(authorization);
        UpdateCartItemCommand command = UpdateCartItemCommand.builder()
            .guestSessionId(guestSessionId)
            .userId(userId)
            .cartItemId(cartItemId)
            .quantity(request.getQuantity())
            .temperature(request.getTemperature())
            .beanOption(request.getBeanOption())
            .decaf(request.getDecaf())
            .build();
        cartUseCase.updateQuantity(command);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<Void> removeItem(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestHeader(value = CART_SESSION_HEADER, required = false) String guestSessionId,
        @PathVariable Long cartItemId
    ) {
        Long userId = resolveUserId(authorization);
        RemoveCartItemCommand command = RemoveCartItemCommand.builder()
            .guestSessionId(guestSessionId)
            .userId(userId)
            .cartItemId(cartItemId)
            .build();
        cartUseCase.removeItem(command);
        return ResponseEntity.ok().build();
    }

    private CartResponseDto toResponse(GetCartResult result) {
        List<CartItemResponseDto> items = result.getItems() == null ? List.of()
            : result.getItems().stream()
                .map(i -> CartItemResponseDto.builder()
                    .id(i.getId())
                    .menuId(i.getMenuId())
                    .menuKorName(i.getMenuKorName())
                    .menuPrice(i.getMenuPrice())
                    .quantity(i.getQuantity())
                    .optionsDisplay(i.getOptionsDisplay())
                    .optionExtraPrice(i.getOptionExtraPrice())
                    .menuImageUrl(i.getMenuImageUrl())
                    .temperature(i.getTemperature())
                    .beanOption(i.getBeanOption())
                    .decaf(i.getDecaf())
                    .isSoldOut(i.getIsSoldOut())
                    .build())
                .collect(Collectors.toList());
        return CartResponseDto.builder()
            .cartId(result.getCartId())
            .items(items)
            .totalQuantity(result.getTotalQuantity())
            .build();
    }
}
