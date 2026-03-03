package com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴 이미지 응답 DTO
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MenuImageResponseDto {
    private Long id;
    private String imageUrl;
    private Long menuId;
    private Integer sortOrder;
}
