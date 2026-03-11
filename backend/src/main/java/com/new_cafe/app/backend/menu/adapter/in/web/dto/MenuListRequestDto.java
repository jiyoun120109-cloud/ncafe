package com.new_cafe.app.backend.menu.adapter.in.web.dto;

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
    /** 정렬: priority, likes, views, price_asc, price_desc */
    private String sort;
}
