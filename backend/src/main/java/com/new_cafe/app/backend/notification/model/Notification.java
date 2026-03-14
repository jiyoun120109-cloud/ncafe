package com.new_cafe.app.backend.notification.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    private Long id;
    private Long userId;
    private String type;
    private Long refId;
    private String title;
    private String message;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
