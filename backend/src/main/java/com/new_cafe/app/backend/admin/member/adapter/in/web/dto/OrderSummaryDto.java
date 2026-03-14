package com.new_cafe.app.backend.admin.member.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderSummaryDto {
    private Long id;
    private String status;
    private Integer totalAmount;
    private LocalDateTime createdAt;
}
