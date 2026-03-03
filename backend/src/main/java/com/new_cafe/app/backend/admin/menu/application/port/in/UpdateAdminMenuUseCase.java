package com.new_cafe.app.backend.admin.menu.application.port.in;

import com.new_cafe.app.backend.admin.menu.application.command.UpdateMenuCommand;
import com.new_cafe.app.backend.admin.menu.application.result.UpdateMenuResult;

/**
 * 메뉴 수정 유스케이스 (Admin Only)
 */
public interface UpdateAdminMenuUseCase {
    UpdateMenuResult updateMenu(UpdateMenuCommand command);
}
