package com.new_cafe.app.backend.menu.application.port.out;

import com.new_cafe.app.backend.menu.model.Menu;
import java.util.List;

public interface MenuRepositoryPort {
    List<Menu> findAllByCategoryIdAndSearchQuery(Integer categoryId, String searchQuery);
    Menu findById(Long id);
}
