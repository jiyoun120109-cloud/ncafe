package com.new_cafe.app.backend.category.adapter.in.web.admin;

import com.new_cafe.app.backend.category.adapter.in.web.dto.CategoryResponseDto;
import com.new_cafe.app.backend.category.adapter.in.web.dto.CategoryListResponseDto;
import com.new_cafe.app.backend.category.application.command.GetAllCategoriesCommand;
import com.new_cafe.app.backend.category.application.command.GetCategoryCommand;
import com.new_cafe.app.backend.category.application.result.CategoryListResult;
import com.new_cafe.app.backend.category.application.result.CategoryListResult.CategoryInfo;
import com.new_cafe.app.backend.category.application.result.GetCategoryResult;
import com.new_cafe.app.backend.category.application.port.in.AdminCategoryUseCase;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;

/**
 * 관리자 전용 카테고리 API (Admin-Only Interface)
 */
@RestController("categoryAdminController")
@RequestMapping("/admin/api/categories")
public class AdminCategoryController {

    private final AdminCategoryUseCase adminCategoryUseCase;

    public AdminCategoryController(AdminCategoryUseCase adminCategoryUseCase) {
        this.adminCategoryUseCase = adminCategoryUseCase;
    }

    /**
     * 카테고리 목록 조회
     * HTTP GET /admin/api/categories
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
     * HTTP GET /admin/api/categories/{id}
     */
    @GetMapping("/{id}")
    public CategoryResponseDto getCategory(@PathVariable Long id) {
        GetCategoryResult result = adminCategoryUseCase.getById(GetCategoryCommand.builder().id(id).build());
        return CategoryResponseDto.builder()
                .id(result.getId())
                .name(result.getName())
                .build();
    }

    /**
     * 카테고리 생성
     * HTTP POST /admin/api/categories/
     */
    @PostMapping("/")
    public String createCategory() {
        adminCategoryUseCase.createCategory();
        return "Admin: Created category";
    }

    /**
     * 카테고리 수정
     * HTTP PUT /admin/api/categories/{id}
     */
    @PutMapping("/{id}")
    public String updateCategory(@PathVariable Long id) {
        adminCategoryUseCase.updateCategory();
        return "Admin: Updated category";
    }

    /**
     * 카테고리 삭제
     * HTTP DELETE /admin/api/categories/{id}
     */
    @DeleteMapping("/{id}")
    public String deleteCategory(@PathVariable Long id) {
        adminCategoryUseCase.deleteCategory();
        return "Admin: Deleted category";
    }

    /**
     * CategoryInfo를 CategoryResponseDto로 변환
     */
    private CategoryResponseDto convertToDto(CategoryInfo categoryInfo) {
        return CategoryResponseDto.builder()
                .id(categoryInfo.getId())
                .name(categoryInfo.getName())
                .build();
    }
}
