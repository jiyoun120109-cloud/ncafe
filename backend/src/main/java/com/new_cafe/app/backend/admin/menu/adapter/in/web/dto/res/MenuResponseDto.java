package com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.res;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴 응답 DTO
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MenuResponseDto {
    private Long id;
    private String korName;
    private String engName;
    private String description;
    private Integer price;
    private Long categoryId;
    private String categoryName;
    private String imageSrc;
    private Boolean isAvailable;
    private Boolean isSoldOut;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private java.util.List<String> badgeTypes;
}
