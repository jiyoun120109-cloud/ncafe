package com.new_cafe.app.backend.admin.menu.application.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * 메뉴 이미지 목록 조회 결과
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetMenuImageListResult {
    private List<MenuImageInfo> menuImages;
    private String altText;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MenuImageInfo {
        private Long id;
        private String imageUrl;
        private Long menuId;
        private Integer sortOrder;
    }
}
