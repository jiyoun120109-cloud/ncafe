package com.new_cafe.app.backend.category.application.service;

import com.new_cafe.app.backend.category.application.command.CreateCategoryCommand;
import com.new_cafe.app.backend.category.application.command.GetAllCategoriesCommand;
import com.new_cafe.app.backend.category.application.command.GetCategoryCommand;
import com.new_cafe.app.backend.category.application.command.UpdateCategoryCommand;
import com.new_cafe.app.backend.category.application.port.in.AdminCategoryUseCase;
import com.new_cafe.app.backend.category.application.port.in.UserCategoryUseCase;
import com.new_cafe.app.backend.category.application.port.out.CategoryRepositoryPort;
import com.new_cafe.app.backend.category.application.result.CategoryListResult;
import com.new_cafe.app.backend.category.application.result.CategoryListResult.CategoryInfo;
import com.new_cafe.app.backend.category.application.result.GetCategoryResult;
import com.new_cafe.app.backend.category.model.Category;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 카테고리 서비스
 * UserCategoryUseCase (조회)와 AdminCategoryUseCase (CRUD) 모두 구현
 */
@Service("categoryService")
public class CategoryService implements UserCategoryUseCase, AdminCategoryUseCase {

    private final CategoryRepositoryPort categoryRepository;

    public CategoryService(CategoryRepositoryPort categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public CategoryListResult getAll(GetAllCategoriesCommand command) {
        List<Category> categories = categoryRepository.findAll();
        List<CategoryInfo> categoryInfos = categories.stream()
                .map(c -> CategoryInfo.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .build())
                .collect(Collectors.toList());

        return CategoryListResult.builder()
                .categories(categoryInfos)
                .total(categoryInfos.size())
                .build();
    }

    @Override
    public GetCategoryResult getById(GetCategoryCommand command) {
        Category category = categoryRepository.findById(command.getId());
        if (category == null) {
            throw new IllegalArgumentException("Category not found with id: " + command.getId());
        }

        return GetCategoryResult.builder()
                .id(category.getId())
                .name(category.getName())
                .build();
    }

    @Override
    public GetCategoryResult createCategory(CreateCategoryCommand command) {
        if (command.getName() == null || command.getName().isBlank()) {
            throw new IllegalArgumentException("카테고리 이름을 입력해 주세요.");
        }
        Category toSave = Category.builder().name(command.getName().trim()).build();
        Category saved = categoryRepository.save(toSave);
        return GetCategoryResult.builder()
                .id(saved.getId())
                .name(saved.getName())
                .build();
    }

    @Override
    public GetCategoryResult updateCategory(UpdateCategoryCommand command) {
        Category existing = categoryRepository.findById(command.getId());
        if (existing == null) {
            throw new IllegalArgumentException("Category not found with id: " + command.getId());
        }
        if (command.getName() == null || command.getName().isBlank()) {
            throw new IllegalArgumentException("카테고리 이름을 입력해 주세요.");
        }
        Category toSave = Category.builder()
                .id(command.getId())
                .name(command.getName().trim())
                .build();
        Category saved = categoryRepository.save(toSave);
        return GetCategoryResult.builder()
                .id(saved.getId())
                .name(saved.getName())
                .build();
    }

    @Override
    public void deleteCategory(Long id) {
        Category existing = categoryRepository.findById(id);
        if (existing == null) {
            throw new IllegalArgumentException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
