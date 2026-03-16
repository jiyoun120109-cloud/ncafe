package com.new_cafe.app.backend.admin.category.adapter.in.web;

import com.new_cafe.app.backend.category.adapter.in.web.dto.CategoryListResponseDto;
import com.new_cafe.app.backend.category.adapter.in.web.dto.CategoryResponseDto;
import com.new_cafe.app.backend.category.adapter.in.web.dto.CreateCategoryRequestDto;
import com.new_cafe.app.backend.category.adapter.in.web.dto.UpdateCategoryRequestDto;
import com.new_cafe.app.backend.category.application.command.CreateCategoryCommand;
import com.new_cafe.app.backend.category.application.command.GetAllCategoriesCommand;
import com.new_cafe.app.backend.category.application.command.GetCategoryCommand;
import com.new_cafe.app.backend.category.application.command.UpdateCategoryCommand;
import com.new_cafe.app.backend.category.application.port.in.AdminCategoryUseCase;
import com.new_cafe.app.backend.category.application.result.CategoryListResult;
import com.new_cafe.app.backend.category.application.result.CategoryListResult.CategoryInfo;
import com.new_cafe.app.backend.category.application.result.GetCategoryResult;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

/**
 * 관리자 전용 카테고리 API (Admin-Only Interface)
 */
@RestController("categoryAdminController")
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {

    private final AdminCategoryUseCase adminCategoryUseCase;

    public AdminCategoryController(AdminCategoryUseCase adminCategoryUseCase) {
        this.adminCategoryUseCase = adminCategoryUseCase;
    }

    /**
     * 카테고리 목록 조회
     * HTTP GET /api/admin/categories
     */
    @GetMapping
    public CategoryListResponseDto getCategories() {
        CategoryListResult result = adminCategoryUseCase.getAll(new GetAllCategoriesCommand());
        return CategoryListResponseDto.builder()
                .categories(result.getCategories().stream()
                        .map(this::convertToDto)
                        .collect(Collectors.toList()))
                .total(result.getTotal())
                .build();
    }

    /**
     * 단일 카테고리 조회
     * HTTP GET /api/admin/categories/{id}
     */
    @GetMapping("/{id}")
    public CategoryResponseDto getCategory(@PathVariable Long id) {
        GetCategoryResult result = adminCategoryUseCase.getById(GetCategoryCommand.builder().id(id).build());
        return CategoryResponseDto.builder()
                .id(result.getId())
                .name(result.getName())
                .icon(result.getIcon())
                .description(result.getDescription())
                .build();
    }

    /**
     * 카테고리 생성
     * HTTP POST /api/admin/categories
     */
    @PostMapping
    public CategoryResponseDto createCategory(@RequestBody CreateCategoryRequestDto request) {
        GetCategoryResult result = adminCategoryUseCase.createCategory(
                CreateCategoryCommand.builder()
                        .name(request.getName())
                        .icon(request.getIcon())
                        .description(request.getDescription())
                        .build());
        return CategoryResponseDto.builder()
                .id(result.getId())
                .name(result.getName())
                .icon(result.getIcon())
                .description(result.getDescription())
                .build();
    }

    /**
     * 카테고리 수정
     * HTTP PUT /api/admin/categories/{id}
     */
    @PutMapping("/{id}")
    public CategoryResponseDto updateCategory(@PathVariable Long id, @RequestBody UpdateCategoryRequestDto request) {
        GetCategoryResult result = adminCategoryUseCase.updateCategory(
                UpdateCategoryCommand.builder()
                        .id(id)
                        .name(request.getName())
                        .icon(request.getIcon())
                        .description(request.getDescription())
                        .build());
        return CategoryResponseDto.builder()
                .id(result.getId())
                .name(result.getName())
                .icon(result.getIcon())
                .description(result.getDescription())
                .build();
    }

    /**
     * 카테고리 삭제
     * HTTP DELETE /api/admin/categories/{id}
     */
    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable Long id) {
        adminCategoryUseCase.deleteCategory(id);
    }

    /**
     * 카테고리 순서 변경 (DnD)
     * HTTP PATCH /api/admin/categories/reorder
     * Body: { "categoryIds": [1, 2, 3] } - 원하는 순서대로 ID 배열
     */
    @PatchMapping("/reorder")
    public void reorderCategories(@RequestBody java.util.Map<String, java.util.List<Long>> body) {
        java.util.List<Long> ids = body != null ? body.get("categoryIds") : null;
        if (ids == null) throw new IllegalArgumentException("categoryIds is required");
        adminCategoryUseCase.reorderCategories(ids);
    }

    private CategoryResponseDto convertToDto(CategoryInfo categoryInfo) {
        return CategoryResponseDto.builder()
                .id(categoryInfo.getId())
                .name(categoryInfo.getName())
                .icon(categoryInfo.getIcon())
                .description(categoryInfo.getDescription())
                .build();
    }
}
