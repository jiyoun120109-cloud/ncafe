package com.new_cafe.app.backend.category.application.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 카테고리 단일 조회 결과
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetCategoryResult {
    private Long id;
    private String name;
    private String icon;
}
