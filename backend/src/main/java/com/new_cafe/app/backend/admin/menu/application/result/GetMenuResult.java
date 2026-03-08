package com.new_cafe.app.backend.admin.menu.application.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 메뉴 상세 조회 결과
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetMenuResult {
    private Long id;
    private String korName;
    private String engName;
    private Long categoryId;
    private String categoryName;
    private Integer price;
    private Boolean isAvailable;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String description;
}
