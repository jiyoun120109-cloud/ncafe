package com.new_cafe.app.backend.admin.menu.application.port.in;

import com.new_cafe.app.backend.admin.menu.application.command.ReorderMenusCommand;

/**
 * 메뉴 정렬 순서 변경 유스케이스 (Admin Only)
 */
public interface ReorderAdminMenuUseCase {
    void reorderMenus(ReorderMenusCommand command);
}
