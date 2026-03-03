package com.new_cafe.app.backend.admin.menu.application.port.in;

import com.new_cafe.app.backend.admin.menu.application.command.MenuListCommand;
import com.new_cafe.app.backend.admin.menu.application.command.GetMenuCommand;
import com.new_cafe.app.backend.admin.menu.application.command.GetMenuImageListCommand;
import com.new_cafe.app.backend.admin.menu.application.result.MenuListResult;
import com.new_cafe.app.backend.admin.menu.application.result.GetMenuResult;
import com.new_cafe.app.backend.admin.menu.application.result.GetMenuImageListResult;

/**
 * 관리자용 메뉴 조회 유스케이스 (Read-Only)
 */
public interface ViewAdminMenuListUseCase {
    MenuListResult getMenus(MenuListCommand command);
    GetMenuResult getMenu(GetMenuCommand command);
    GetMenuImageListResult getMenuImageList(GetMenuImageListCommand command);
}
