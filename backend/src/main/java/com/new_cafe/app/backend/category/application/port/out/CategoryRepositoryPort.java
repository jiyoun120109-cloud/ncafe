package com.new_cafe.app.backend.category.application.port.out;

import com.new_cafe.app.backend.category.domain.model.Category;
import java.util.List;

public interface CategoryRepositoryPort {
    List<Category> findAll();
    Category findById(Long id);
}
