package com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴 생성 응답 DTO
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateMenuResponseDto {
    private Long id;
}
