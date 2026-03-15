package com.new_cafe.app.backend.category.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateCategoryRequestDto {
    private String name;
    private String icon;
    private String description;
}
