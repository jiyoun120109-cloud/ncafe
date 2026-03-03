package com.new_cafe.app.backend.menu.adapter.in.web.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴 이미지 목록 응답 DTO
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MenuImageListResponseDto {
    private List<MenuImageResponseDto> menuImages;
    private String altText;
}
