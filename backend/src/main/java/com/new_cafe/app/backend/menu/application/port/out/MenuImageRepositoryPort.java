package com.new_cafe.app.backend.menu.application.port.out;

import com.new_cafe.app.backend.menu.model.MenuImage;
import java.util.List;

public interface MenuImageRepositoryPort {
    List<MenuImage> findAllByMenuId(Long menuId);

    MenuImage save(MenuImage menuImage);

    void deleteAllByMenuId(Long menuId);
}
