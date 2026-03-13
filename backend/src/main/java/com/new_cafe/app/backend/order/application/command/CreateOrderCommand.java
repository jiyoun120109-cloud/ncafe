package com.new_cafe.app.backend.order.application.command;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderCommand {
    private Long userId;
    private String guestEmail;
    private String guestPhone;
    @Builder.Default
    private List<OrderItemDto> items = List.of();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDto {
        private Long menuId;
        private String menuName;
        private Integer quantity;
        private Integer unitPrice;
        private Integer optionExtraPrice;
        private String optionsDisplay;
    }
}
