package com.new_cafe.app.backend.admin.menu.application.port.in;

import com.new_cafe.app.backend.admin.menu.application.command.DeleteMenuCommand;

/**
 * 메뉴 삭제 유스케이스 (Admin Only)
 */
public interface DeleteAdminMenuUseCase {
    void deleteMenu(DeleteMenuCommand command);
}
