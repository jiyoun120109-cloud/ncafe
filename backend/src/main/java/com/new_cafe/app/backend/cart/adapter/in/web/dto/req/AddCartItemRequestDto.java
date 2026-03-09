package com.new_cafe.app.backend.cart.adapter.in.web.dto.req;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddCartItemRequestDto {
    private Long menuId;
    @Builder.Default
    private Integer quantity = 1;
    /** HOT, ICED */
    private String temperature;
    /** 원두 옵션 (예: 기본 원두, 에티오피아) */
    private String beanOption;
    /** 디카페인 여부 (추가 300원) */
    private Boolean decaf;
}
