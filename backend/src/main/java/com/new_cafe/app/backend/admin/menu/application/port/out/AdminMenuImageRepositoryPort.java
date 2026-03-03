package com.new_cafe.app.backend.admin.menu.application.port.out;

import com.new_cafe.app.backend.admin.menu.model.AdminMenuImage;
import java.util.List;

public interface AdminMenuImageRepositoryPort {
    List<AdminMenuImage> findAllByMenuId(Long menuId);
}
