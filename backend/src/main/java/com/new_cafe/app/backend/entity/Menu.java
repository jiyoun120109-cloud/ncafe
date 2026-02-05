package com.new_cafe.app.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Menu {
    private Long id;
    private String korName;
    private String engName;
    private String description;
    private Integer price;
    private Long categoryId;
    private Boolean isAvailable;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Category category;
}