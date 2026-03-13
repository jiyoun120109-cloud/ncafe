package com.new_cafe.app.backend.order.domain.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    private Long id;
    private Long orderId;
    private Long menuId;
    private String menuName;
    @Builder.Default
    private Integer quantity = 1;
    @Builder.Default
    private Integer unitPrice = 0;
    @Builder.Default
    private Integer optionExtraPrice = 0;
    private String optionsDisplay;
}
