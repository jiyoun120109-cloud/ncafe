package com.new_cafe.app.backend.category.application.port.out;

import com.new_cafe.app.backend.category.model.Category;
import java.util.List;

public interface CategoryRepositoryPort {
    List<Category> findAll();
    Category findById(Long id);
    Category save(Category category);
    void deleteById(Long id);
    void updateDisplayOrder(java.util.List<Long> categoryIdsInOrder);
}
