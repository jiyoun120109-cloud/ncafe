package com.new_cafe.app.backend.cart.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 장바구니 도메인 모델
 * 비회원(guestSessionId) / 회원(userId) 구분하여 하나의 장바구니로 관리
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cart {
    private Long id;
    private String guestSessionId;
    private Long userId;
    @Builder.Default
    private List<CartItem> items = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public int getTotalQuantity() {
        return items == null ? 0 : items.stream()
            .mapToInt(CartItem::getQuantity)
            .sum();
    }
}
