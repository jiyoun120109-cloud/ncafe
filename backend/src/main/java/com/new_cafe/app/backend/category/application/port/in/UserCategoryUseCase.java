package com.new_cafe.app.backend.category.application.port.in;

import com.new_cafe.app.backend.category.application.command.GetAllCategoriesCommand;
import com.new_cafe.app.backend.category.application.command.GetCategoryCommand;
import com.new_cafe.app.backend.category.application.result.CategoryListResult;
import com.new_cafe.app.backend.category.application.result.GetCategoryResult;

/**
 * 사용자용 카테고리 조회 유스케이스 (Read-Only)
 */
public interface UserCategoryUseCase {
    CategoryListResult getAll(GetAllCategoriesCommand command);

    GetCategoryResult getById(GetCategoryCommand command);
}
