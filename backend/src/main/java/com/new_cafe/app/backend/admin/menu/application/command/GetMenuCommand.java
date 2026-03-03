package com.new_cafe.app.backend.admin.menu.application.command;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴 상세 조회 커맨드
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetMenuCommand {
    private Long id;
}
