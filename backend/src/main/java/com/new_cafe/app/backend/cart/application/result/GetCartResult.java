package com.new_cafe.app.backend.cart.application.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetCartResult {
    private Long cartId;
    @Builder.Default
    private List<CartItemResult> items = new ArrayList<>();
    private int totalQuantity;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItemResult {
        private Long id;
        private Long menuId;
        private String menuKorName;
        private Integer menuPrice;
        private Integer quantity;
        private String optionsDisplay;
        private Integer optionExtraPrice;
        private String menuImageUrl;
        private String temperature;
        private String beanOption;
        private Boolean decaf;
        /** 품절 여부 (true면 품절) */
        private Boolean isSoldOut;
    }
}
