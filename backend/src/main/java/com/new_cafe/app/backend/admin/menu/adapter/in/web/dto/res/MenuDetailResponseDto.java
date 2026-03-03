package com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.res;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴 상세 응답 DTO
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MenuDetailResponseDto {
    private Long id;
    private String korName;
    private String engName;
    private String categoryName;
    private Integer price;
    private Boolean isAvailable;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String description;
}
