package com.new_cafe.app.backend.admin.menu.adapter.out.persistence;

import com.new_cafe.app.backend.admin.menu.application.port.out.AdminMenuRepositoryPort;
import com.new_cafe.app.backend.admin.menu.model.AdminMenu;
import com.new_cafe.app.backend.menu.adapter.out.jpa.MenuEntity;
import com.new_cafe.app.backend.menu.adapter.out.jpa.MenuJpaRepository;
import com.new_cafe.app.backend.category.model.Category;
import com.new_cafe.app.backend.category.adapter.out.jpa.CategoryEntity;
import com.new_cafe.app.backend.category.adapter.out.jpa.CategoryJpaRepository;

import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class AdminMenuPersistenceAdapter implements AdminMenuRepositoryPort {

    private final MenuJpaRepository menuJpaRepository;
    private final CategoryJpaRepository categoryJpaRepository;

    public AdminMenuPersistenceAdapter(MenuJpaRepository menuJpaRepository,
                                       CategoryJpaRepository categoryJpaRepository) {
        this.menuJpaRepository = menuJpaRepository;
        this.categoryJpaRepository = categoryJpaRepository;
    }

    @Override
    public List<AdminMenu> findAllByCategoryIdAndSearchQuery(Integer categoryId, String searchQuery) {
        List<MenuEntity> entities = menuJpaRepository.findAll();

        return entities.stream()
            .filter(e -> categoryId == null || e.getCategoryId() == null || e.getCategoryId().equals(categoryId.longValue()))
            .filter(e -> searchQuery == null || searchQuery.isBlank() ||
                (e.getKorName() != null && e.getKorName().contains(searchQuery)) ||
                (e.getEngName() != null && e.getEngName().contains(searchQuery)) ||
                (e.getDescription() != null && e.getDescription().contains(searchQuery)))
            .map(this::toDomain)
            .sorted(Comparator.comparing(AdminMenu::getSortOrder, Comparator.nullsLast(Comparator.naturalOrder())))
            .collect(Collectors.toList());
    }

    @Override
    public AdminMenu findById(Long id) {
        return menuJpaRepository.findById(id)
            .map(this::toDomain)
            .orElse(null);
    }

    @Override
    public AdminMenu save(AdminMenu menu) {
        MenuEntity entity;
        if (menu.getId() == null) {
            entity = toEntity(menu, LocalDateTime.now());
        } else {
            entity = menuJpaRepository.findById(menu.getId())
                .map(existing -> toEntity(menu, existing.getCreatedAt()))
                .orElseGet(() -> toEntity(menu, LocalDateTime.now()));
        }
        entity.setUpdatedAt(LocalDateTime.now());
        MenuEntity saved = menuJpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public void deleteById(Long id) {
        menuJpaRepository.deleteById(id);
    }

    private MenuEntity toEntity(AdminMenu menu, LocalDateTime createdAt) {
        CategoryEntity category = menu.getCategoryId() != null
            ? categoryJpaRepository.findById(menu.getCategoryId()).orElse(null)
            : null;
        return MenuEntity.builder()
            .id(menu.getId())
            .korName(menu.getKorName())
            .engName(menu.getEngName())
            .description(menu.getDescription())
            .price(menu.getPrice())
            .category(category)
            .isAvailable(menu.getIsAvailable() != null ? menu.getIsAvailable() : true)
            .isSoldOut(menu.getIsSoldOut() != null ? menu.getIsSoldOut() : false)
            .sortOrder(menu.getSortOrder() != null ? menu.getSortOrder() : 0)
            .optionsJson(menu.getOptionsJson())
            .productInfoJson(menu.getProductInfoJson())
            .isPopular(menu.getIsPopular())
            .isNew(menu.getIsNew())
            .isRecommended(menu.getIsRecommended())
            .displayPriority(menu.getDisplayPriority())
            .likeCount(menu.getLikeCount())
            .viewCount(menu.getViewCount())
            .createdAt(createdAt)
            .updatedAt(LocalDateTime.now())
            .build();
    }

    private AdminMenu toDomain(MenuEntity e) {
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
            .isSoldOut(e.getIsSoldOut())
            .sortOrder(e.getSortOrder())
            .optionsJson(e.getOptionsJson())
            .productInfoJson(e.getProductInfoJson())
            .isPopular(e.getIsPopular())
            .isNew(e.getIsNew())
            .isRecommended(e.getIsRecommended())
            .displayPriority(e.getDisplayPriority())
            .likeCount(e.getLikeCount())
            .viewCount(e.getViewCount())
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

