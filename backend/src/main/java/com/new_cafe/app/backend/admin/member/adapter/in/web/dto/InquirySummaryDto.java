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
public class InquirySummaryDto {
    private Long id;
    private String title;
    private LocalDateTime createdAt;
}
