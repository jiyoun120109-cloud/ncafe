package com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.res;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴 목록 응답 DTO
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MenuListResponseDto {
    private List<MenuResponseDto> menus;
    private int total;
}
