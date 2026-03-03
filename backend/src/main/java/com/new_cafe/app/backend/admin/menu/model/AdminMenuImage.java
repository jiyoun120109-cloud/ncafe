package com.new_cafe.app.backend.admin.menu.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminMenuImage {
    private Long id;
    private Long menuId;
    private String imageSrc;
    private Integer sortOrder;
}
