package com.new_cafe.app.backend.admin.menu.application.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴 생성 결과
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateMenuResult {
    private Long id;
}
