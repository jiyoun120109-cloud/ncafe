package com.new_cafe.app.backend.dto;

import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MenuImageResponse {
    private Long id;
    private String imageUrl;
    private Long menuId;
    private Integer sortOrder;
}
