package com.new_cafe.app.backend.menu.adapter.out.persistence;

import com.new_cafe.app.backend.menu.application.port.out.MenuRepositoryPort;
import com.new_cafe.app.backend.menu.model.Menu;
import com.new_cafe.app.backend.menu.adapter.out.jpa.MenuEntity;
import com.new_cafe.app.backend.menu.adapter.out.jpa.MenuJpaRepository;
import com.new_cafe.app.backend.category.domain.model.Category;
import com.new_cafe.app.backend.category.adapter.out.jpa.CategoryEntity;

import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

@Repository
public class MenuPersistenceAdapter implements MenuRepositoryPort {

    private final MenuJpaRepository menuJpaRepository;

    public MenuPersistenceAdapter(MenuJpaRepository menuJpaRepository) {
        this.menuJpaRepository = menuJpaRepository;
    }

    @Override
    public List<Menu> findAllByCategoryIdAndSearchQuery(Integer categoryId, String searchQuery) {
        List<MenuEntity> entities = menuJpaRepository.findAll();

        // categoryId null 또는 0이면 전체 조회 (0은 프론트 "전체" 선택 시 올 수 있음)
        boolean listAll = categoryId == null || categoryId.intValue() == 0;
        return entities.stream()
            .filter(e -> listAll || e.getCategoryId() == null || e.getCategoryId().equals(categoryId.longValue()))
            .filter(e -> searchQuery == null || searchQuery.isBlank() ||
                (e.getKorName() != null && e.getKorName().contains(searchQuery)) ||
                (e.getEngName() != null && e.getEngName().contains(searchQuery)) ||
                (e.getDescription() != null && e.getDescription().contains(searchQuery)))
            .map(this::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public Menu findById(Long id) {
        return menuJpaRepository.findById(id)
            .map(this::toDomain)
            .orElse(null);
    }

    private Menu toDomain(MenuEntity e) {
        Category category = e.getCategory() != null ? categoryEntityToDomain(e.getCategory()) : null;
        
        return Menu.builder()
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


