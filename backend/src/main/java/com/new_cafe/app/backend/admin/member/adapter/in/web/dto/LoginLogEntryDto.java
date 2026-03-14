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
public class LoginLogEntryDto {
    private Boolean success;
    private String ipAddress;
    private LocalDateTime createdAt;
}
