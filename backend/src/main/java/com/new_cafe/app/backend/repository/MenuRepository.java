package com.new_cafe.app.backend.repository;

import java.util.List;
import com.new_cafe.app.backend.entity.Menu;
import com.new_cafe.app.backend.entity.MenuImage;

public interface MenuRepository {
    List<Menu> findAll();

    List<Menu> findAllByCategoryId(Integer categoryId);

    List<Menu> findAllByCategoryIdAndSearchQuery(Integer categoryId, String searchQuery);

    Menu findById(Long id);
}
