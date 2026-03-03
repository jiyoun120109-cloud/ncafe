package com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.req;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴 목록 조회 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuListRequestDto {
    private Integer categoryId;
    private String searchQuery;
}
