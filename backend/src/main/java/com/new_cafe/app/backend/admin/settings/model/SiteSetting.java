package com.new_cafe.app.backend.admin.settings.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteSetting {
    private String key;
    private String value;
    private LocalDateTime updatedAt;
}
