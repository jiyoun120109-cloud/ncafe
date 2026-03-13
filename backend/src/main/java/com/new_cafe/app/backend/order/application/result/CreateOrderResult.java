package com.new_cafe.app.backend.order.application.result;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderResult {
    private Long orderId;
    private Integer totalAmount;
    private String status;
}
