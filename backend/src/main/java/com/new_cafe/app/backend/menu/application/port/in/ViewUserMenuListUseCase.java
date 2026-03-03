package com.new_cafe.app.backend.menu.application.port.in;

import com.new_cafe.app.backend.menu.application.command.MenuListCommand;
import com.new_cafe.app.backend.menu.application.command.GetMenuCommand;
import com.new_cafe.app.backend.menu.application.command.GetMenuImageListCommand;
import com.new_cafe.app.backend.menu.application.result.MenuListResult;
import com.new_cafe.app.backend.menu.application.result.GetMenuResult;
import com.new_cafe.app.backend.menu.application.result.GetMenuImageListResult;

/**
 * 사용자용 메뉴 조회 유스케이스 (Read-Only)
 */
public interface ViewUserMenuListUseCase {
    MenuListResult getMenus(MenuListCommand command);
    GetMenuResult getMenu(GetMenuCommand command);
    GetMenuImageListResult getMenuImageList(GetMenuImageListCommand command);
}
