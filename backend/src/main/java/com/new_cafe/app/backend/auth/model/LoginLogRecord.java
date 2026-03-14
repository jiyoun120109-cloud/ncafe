package com.new_cafe.app.backend.auth.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginLogRecord {
    private Long id;
    private Long userId;
    private String nickname;
    private Boolean success;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime createdAt;
}
