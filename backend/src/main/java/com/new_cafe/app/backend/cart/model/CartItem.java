package com.new_cafe.app.backend.cart.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 장바구니 항목 도메인 모델
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {
    private Long id;
    private Long cartId;
    private Long menuId;
    private String menuKorName;
    private Integer menuPrice;
    private Integer quantity;
    /** HOT, ICED 등 */
    private String optionTemperature;
    /** 원두 옵션명 */
    private String optionBean;
    private Boolean optionDecaf;
    private Integer optionExtraPrice;
    /** 화면 표시용: "ICED | 기본 원두 | 디카페인" */
    private String optionsDisplay;
}
