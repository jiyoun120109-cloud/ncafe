package com.new_cafe.app.backend.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MenuResponse {
    private Long id;
    private String korName;
    private String engName;
    private String description;
    private Integer price;
    private String categoryName;
    private String imageSrc;
    private Boolean isAvailable;
    private Boolean isSoldOut;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
