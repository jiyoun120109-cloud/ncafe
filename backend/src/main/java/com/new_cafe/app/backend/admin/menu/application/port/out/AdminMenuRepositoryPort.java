package com.new_cafe.app.backend.admin.menu.application.port.out;

import com.new_cafe.app.backend.admin.menu.model.AdminMenu;
import java.util.List;

public interface AdminMenuRepositoryPort {
    List<AdminMenu> findAllByCategoryIdAndSearchQuery(Integer categoryId, String searchQuery);
    AdminMenu findById(Long id);
}
