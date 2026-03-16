package com.new_cafe.app.backend.admin.menu.application.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.time.LocalDateTime;

/**
 * 메뉴 목록 조회 결과
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuListResult {
    private List<MenuInfo> menus;
    private int total;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MenuInfo {
        private Long id;
        private String korName;
        private String engName;
        private String description;
        private Integer price;
        private Long categoryId;
        private String categoryName;
        private String imageSrc;
        private Boolean isAvailable;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private java.util.List<String> badgeTypes;
    }
}
