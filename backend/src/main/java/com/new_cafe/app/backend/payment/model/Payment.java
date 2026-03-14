package com.new_cafe.app.backend.payment.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    private Long id;
    private Long orderId;
    private String method;
    private String status;
    private String pgTid;
    private Integer amount;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}
