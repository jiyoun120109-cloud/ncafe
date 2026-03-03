package com.new_cafe.app.backend.admin.menu.application.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴 수정 결과
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMenuResult {
    private Long id;
}
