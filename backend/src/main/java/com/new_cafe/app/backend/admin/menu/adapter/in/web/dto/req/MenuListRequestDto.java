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
    /** 정렬: views_desc, likes_desc, price_desc, price_asc, name_asc, name_eng_asc */
    private String sortBy;
    /** 판매 상태 필터: true=판매중, false=품절, null=전체 */
    private Boolean isAvailable;
}
