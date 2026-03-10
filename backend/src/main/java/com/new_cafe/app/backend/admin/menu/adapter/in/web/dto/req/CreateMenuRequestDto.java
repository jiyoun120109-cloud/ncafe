package com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.req;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴 생성 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateMenuRequestDto {
    private String korName;
    private String engName;
    private String description;
    private Integer price;
    private Long categoryId;
    private Boolean isAvailable;
    /** 옵션 목록 JSON 문자열 (예: [{"name":"사이즈","type":"radio","required":true}] ) */
    private String optionsJson;
    /** 상품 정보 제공 고시 JSON (영양정보, 알레르기정보 등) */
    private String productInfoJson;
}
