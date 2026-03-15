package com.new_cafe.app.backend.category.application.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * 카테고리 목록 조회 결과
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryListResult {
    private List<CategoryInfo> categories;
    private int total;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryInfo {
        private Long id;
        private String name;
        private String icon;
        private String description;
    }
}
