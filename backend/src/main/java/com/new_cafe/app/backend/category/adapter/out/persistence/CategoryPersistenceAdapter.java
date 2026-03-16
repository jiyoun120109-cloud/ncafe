package com.new_cafe.app.backend.category.adapter.out.persistence;

import com.new_cafe.app.backend.category.application.port.out.CategoryRepositoryPort;
import com.new_cafe.app.backend.category.model.Category;
import com.new_cafe.app.backend.category.adapter.out.jpa.CategoryEntity;
import com.new_cafe.app.backend.category.adapter.out.jpa.CategoryJpaRepository;

import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class CategoryPersistenceAdapter implements CategoryRepositoryPort {

    private final CategoryJpaRepository categoryJpaRepository;

    public CategoryPersistenceAdapter(CategoryJpaRepository categoryJpaRepository) {
        this.categoryJpaRepository = categoryJpaRepository;
    }

    @Override
    public List<Category> findAll() {
        List<CategoryEntity> entities = categoryJpaRepository.findAllByOrderByDisplayOrderAscIdAsc();
        return entities.stream()
            .map(this::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public Category findById(Long id) {
        if (id == null) return null;
        return categoryJpaRepository.findById(id)
            .map(this::toDomain)
            .orElse(null);
    }

    @Override
    public Category save(Category category) {
        LocalDateTime now = LocalDateTime.now();
        if (category.getId() == null) {
            Integer nextOrder = category.getDisplayOrder() != null
                ? category.getDisplayOrder()
                : categoryJpaRepository.findMaxDisplayOrder().orElse(0) + 1;
            CategoryEntity entity = CategoryEntity.builder()
                .name(category.getName())
                .icon(category.getIcon())
                .description(category.getDescription())
                .displayOrder(nextOrder)
                .createdAt(now)
                .updatedAt(now)
                .build();
            CategoryEntity saved = categoryJpaRepository.save(entity);
            return toDomain(saved);
        }
        CategoryEntity existing = categoryJpaRepository.findById(category.getId())
            .orElseThrow(() -> new IllegalArgumentException("Category not found: " + category.getId()));
        existing.setName(category.getName());
        existing.setIcon(category.getIcon());
        existing.setDescription(category.getDescription());
        if (category.getDisplayOrder() != null) {
            existing.setDisplayOrder(category.getDisplayOrder());
        }
        existing.setUpdatedAt(now);
        CategoryEntity saved = categoryJpaRepository.save(existing);
        return toDomain(saved);
    }

    @Override
    public void deleteById(Long id) {
        categoryJpaRepository.deleteById(id);
    }

    @Override
    public void updateDisplayOrder(List<Long> categoryIdsInOrder) {
        if (categoryIdsInOrder == null || categoryIdsInOrder.isEmpty()) return;
        for (int i = 0; i < categoryIdsInOrder.size(); i++) {
            final int order = i;
            Long id = categoryIdsInOrder.get(i);
            categoryJpaRepository.findById(id).ifPresent(e -> {
                e.setDisplayOrder(order);
                e.setUpdatedAt(LocalDateTime.now());
                categoryJpaRepository.save(e);
            });
        }
    }

    private Category toDomain(CategoryEntity e) {
        return Category.builder()
            .id(e.getId())
            .name(e.getName())
            .icon(e.getIcon())
            .description(e.getDescription())
            .displayOrder(e.getDisplayOrder())
            .build();
    }
}
