package com.new_cafe.app.backend.menu.application.command;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴 이미지 목록 조회 커맨드
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetMenuImageListCommand {
    private Long menuId;
}
