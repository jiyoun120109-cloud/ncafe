package com.new_cafe.app.backend.category.adapter.in.web;

import com.new_cafe.app.backend.category.adapter.in.web.dto.CategoryResponseDto;
import com.new_cafe.app.backend.category.adapter.in.web.dto.CategoryListResponseDto;
import com.new_cafe.app.backend.category.application.command.GetAllCategoriesCommand;
import com.new_cafe.app.backend.category.application.command.GetCategoryCommand;
import com.new_cafe.app.backend.category.application.result.CategoryListResult;
import com.new_cafe.app.backend.category.application.result.CategoryListResult.CategoryInfo;
import com.new_cafe.app.backend.category.application.result.GetCategoryResult;
import com.new_cafe.app.backend.category.application.port.in.UserCategoryUseCase;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.stream.Collectors;

/**
 * 일반 사용자용 카테고리 API (Public Interface)
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final UserCategoryUseCase userCategoryUseCase;

    public CategoryController(UserCategoryUseCase userCategoryUseCase) {
        this.userCategoryUseCase = userCategoryUseCase;
    }

    /**
     * 카테고리 목록 조회
     * HTTP GET /api/categories
     */
    @GetMapping
    public CategoryListResponseDto getCategories() {
        CategoryListResult result = userCategoryUseCase.getAll(new GetAllCategoriesCommand());
        return CategoryListResponseDto.builder()
                .categories(result.getCategories().stream()
                        .map(this::convertToDto)
                        .collect(Collectors.toList()))
                .total(result.getTotal())
                .build();
    }

    /**
     * 단일 카테고리 조회
     * HTTP GET /api/categories/{id}
     */
    @GetMapping("/{id}")
    public CategoryResponseDto getCategory(@PathVariable Long id) {
        GetCategoryResult result = userCategoryUseCase.getById(GetCategoryCommand.builder().id(id).build());
        return CategoryResponseDto.builder()
                .id(result.getId())
                .name(result.getName())
                .icon(result.getIcon())
                .build();
    }

    private CategoryResponseDto convertToDto(CategoryInfo categoryInfo) {
        return CategoryResponseDto.builder()
                .id(categoryInfo.getId())
                .name(categoryInfo.getName())
                .icon(categoryInfo.getIcon())
                .build();
    }
}
