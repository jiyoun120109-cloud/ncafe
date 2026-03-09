package com.new_cafe.app.backend.cart.adapter.in.web.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponseDto {
    private Long cartId;
    private List<CartItemResponseDto> items;
    private Integer totalQuantity;
}
