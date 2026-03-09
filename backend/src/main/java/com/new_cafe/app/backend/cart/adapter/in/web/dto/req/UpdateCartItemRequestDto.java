package com.new_cafe.app.backend.cart.adapter.in.web.dto.req;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCartItemRequestDto {
    private Integer quantity;
    /** HOT, ICED */
    private String temperature;
    /** 원두 옵션 */
    private String beanOption;
    /** 디카페인 여부 */
    private Boolean decaf;
}
