package com.new_cafe.app.backend.admin.menu.application.port.in;

import com.new_cafe.app.backend.admin.menu.application.command.CreateMenuCommand;
import com.new_cafe.app.backend.admin.menu.application.result.CreateMenuResult;

/**
 * 메뉴 생성 유스케이스 (Admin Only)
 */
public interface CreateAdminMenuUseCase {
    CreateMenuResult createMenu(CreateMenuCommand command);
}
