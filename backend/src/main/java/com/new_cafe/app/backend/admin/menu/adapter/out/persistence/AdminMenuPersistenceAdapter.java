package com.new_cafe.app.backend.admin.menu.adapter.out.persistence;

import com.new_cafe.app.backend.admin.menu.application.port.out.AdminMenuRepositoryPort;
import com.new_cafe.app.backend.admin.menu.model.AdminMenu;
import com.new_cafe.app.backend.admin.menu.adapter.out.jpa.AdminMenuEntity;
import com.new_cafe.app.backend.admin.menu.adapter.out.jpa.AdminMenuJpaRepository;
import com.new_cafe.app.backend.category.domain.model.Category;
import com.new_cafe.app.backend.category.adapter.out.jpa.CategoryEntity;

import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

@Repository
public class AdminMenuPersistenceAdapter implements AdminMenuRepositoryPort {

    private final AdminMenuJpaRepository adminMenuJpaRepository;

    public AdminMenuPersistenceAdapter(AdminMenuJpaRepository adminMenuJpaRepository) {
        this.adminMenuJpaRepository = adminMenuJpaRepository;
    }

    @Override
    public List<AdminMenu> findAllByCategoryIdAndSearchQuery(Integer categoryId, String searchQuery) {
        List<AdminMenuEntity> entities = adminMenuJpaRepository.findAll();

        return entities.stream()
            .filter(e -> categoryId == null || e.getCategoryId() == null || e.getCategoryId().equals(categoryId.longValue()))
            .filter(e -> searchQuery == null || searchQuery.isBlank() ||
                (e.getKorName() != null && e.getKorName().contains(searchQuery)) ||
                (e.getEngName() != null && e.getEngName().contains(searchQuery)) ||
                (e.getDescription() != null && e.getDescription().contains(searchQuery)))
            .map(this::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public AdminMenu findById(Long id) {
        return adminMenuJpaRepository.findById(id)
            .map(this::toDomain)
            .orElse(null);
    }

    private AdminMenu toDomain(AdminMenuEntity e) {
        Category category = e.getCategory() != null ? categoryEntityToDomain(e.getCategory()) : null;
        
        return AdminMenu.builder()
            .id(e.getId())
            .korName(e.getKorName())
            .engName(e.getEngName())
            .description(e.getDescription())
            .price(e.getPrice())
            .categoryId(e.getCategoryId())
            .category(category)
            .isAvailable(e.getIsAvailable())
            .createdAt(e.getCreatedAt())
            .updatedAt(e.getUpdatedAt())
            .build();
    }

    private Category categoryEntityToDomain(CategoryEntity e) {
        return Category.builder()
            .id(e.getId())
            .name(e.getName())
            .build();
    }
}

