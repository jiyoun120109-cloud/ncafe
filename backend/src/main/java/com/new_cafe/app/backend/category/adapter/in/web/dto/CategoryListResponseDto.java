package com.new_cafe.app.backend.category.adapter.in.web.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 카테고리 목록 응답 DTO
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CategoryListResponseDto {
    private List<CategoryResponseDto> categories;
    private int total;
}
