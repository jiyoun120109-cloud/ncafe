package com.new_cafe.app.backend.cart.application.command;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddCartItemCommand {
    private String guestSessionId;
    private Long userId;
    private Long menuId;
    @Builder.Default
    private int quantity = 1;
    private String temperature;
    private String beanOption;
    private Boolean decaf;
}
