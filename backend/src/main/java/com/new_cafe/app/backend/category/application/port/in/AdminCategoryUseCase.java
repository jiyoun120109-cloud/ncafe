package com.new_cafe.app.backend.category.application.port.in;

import com.new_cafe.app.backend.category.application.command.CreateCategoryCommand;
import com.new_cafe.app.backend.category.application.command.GetAllCategoriesCommand;
import com.new_cafe.app.backend.category.application.command.GetCategoryCommand;
import com.new_cafe.app.backend.category.application.command.UpdateCategoryCommand;
import com.new_cafe.app.backend.category.application.result.CategoryListResult;
import com.new_cafe.app.backend.category.application.result.GetCategoryResult;

/**
 * 관리자용 카테고리 관리 유스케이스 (CRUD)
 */
public interface AdminCategoryUseCase {
    CategoryListResult getAll(GetAllCategoriesCommand command);

    GetCategoryResult getById(GetCategoryCommand command);

    GetCategoryResult createCategory(CreateCategoryCommand command);

    GetCategoryResult updateCategory(UpdateCategoryCommand command);

    void deleteCategory(Long id);

    void reorderCategories(java.util.List<Long> categoryIdsInOrder);
}
