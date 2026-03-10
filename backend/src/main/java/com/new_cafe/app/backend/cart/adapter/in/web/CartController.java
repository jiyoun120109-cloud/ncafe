package com.new_cafe.app.backend.cart.adapter.in.web;

import com.new_cafe.app.backend.cart.application.command.*;
import com.new_cafe.app.backend.cart.application.port.in.CartUseCase;
import com.new_cafe.app.backend.cart.application.result.GetCartResult;
import com.new_cafe.app.backend.cart.adapter.in.web.dto.req.AddCartItemRequestDto;
import com.new_cafe.app.backend.cart.adapter.in.web.dto.req.UpdateCartItemRequestDto;
import com.new_cafe.app.backend.cart.adapter.in.web.dto.res.CartItemResponseDto;
import com.new_cafe.app.backend.cart.adapter.in.web.dto.res.CartResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 장바구니 API (회원/비회원 공통)
 * 비회원: X-Cart-Session-Id 헤더로 장바구니 식별
 * 회원: 추후 Authorization 기반 userId 바인딩 가능
 */
@RestController
@RequestMapping("/api/cart")
public class CartController {

    private static final String CART_SESSION_HEADER = "X-Cart-Session-Id";

    private final CartUseCase cartUseCase;

    public CartController(CartUseCase cartUseCase) {
        this.cartUseCase = cartUseCase;
    }

    @GetMapping
    public ResponseEntity<CartResponseDto> getCart(@RequestHeader(value = CART_SESSION_HEADER, required = false) String guestSessionId) {
        GetCartCommand command = GetCartCommand.builder()
            .guestSessionId(guestSessionId)
            .userId(null)
            .build();
        GetCartResult result = cartUseCase.getCart(command);
        return ResponseEntity.ok(toResponse(result));
    }

    @PostMapping("/items")
    public ResponseEntity<Void> addItem(
        @RequestHeader(value = CART_SESSION_HEADER, required = false) String guestSessionId,
        @RequestBody AddCartItemRequestDto request
    ) {
        if (request.getMenuId() == null) {
            return ResponseEntity.badRequest().build();
        }
        AddCartItemCommand command = AddCartItemCommand.builder()
            .guestSessionId(guestSessionId)
            .userId(null)
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
        @RequestHeader(value = CART_SESSION_HEADER, required = false) String guestSessionId,
        @PathVariable Long cartItemId,
        @RequestBody UpdateCartItemRequestDto request
    ) {
        if (request.getQuantity() == null && request.getTemperature() == null
            && request.getBeanOption() == null && request.getDecaf() == null) {
            return ResponseEntity.badRequest().build();
        }
        UpdateCartItemCommand command = UpdateCartItemCommand.builder()
            .guestSessionId(guestSessionId)
            .userId(null)
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
        @RequestHeader(value = CART_SESSION_HEADER, required = false) String guestSessionId,
        @PathVariable Long cartItemId
    ) {
        RemoveCartItemCommand command = RemoveCartItemCommand.builder()
            .guestSessionId(guestSessionId)
            .userId(null)
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
