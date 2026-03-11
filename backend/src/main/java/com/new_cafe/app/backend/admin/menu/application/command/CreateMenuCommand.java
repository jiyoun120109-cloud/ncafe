package com.new_cafe.app.backend.admin.menu.application.command;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴 생성 커맨드
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateMenuCommand {
    private String korName;
    private String engName;
    private String description;
    private Integer price;
    private Long categoryId;
    private Boolean isAvailable;
    /** 옵션 목록 JSON 문자열 */
    private String optionsJson;
    /** 상품 정보 제공 고시 JSON */
    private String productInfoJson;
    private Boolean isPopular;
    private Boolean isNew;
    private Boolean isRecommended;
    private Integer displayPriority;
    private Integer likeCount;
    private Integer viewCount;
}
