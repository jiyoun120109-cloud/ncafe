package com.new_cafe.app.backend.menu.model;

import com.new_cafe.app.backend.category.domain.model.Category;
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
    private Category category;
    private Boolean isAvailable;
    /** 상품 정보 제공 고시 JSON (영양정보, 알레르기정보 등) */
    private String productInfoJson;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
