package com.new_cafe.app.backend.admin.menu.adapter.out.persistence;

import com.new_cafe.app.backend.admin.menu.application.port.out.AdminMenuImageRepositoryPort;
import com.new_cafe.app.backend.admin.menu.model.AdminMenuImage;
import com.new_cafe.app.backend.menu.adapter.out.jpa.MenuImageEntity;
import com.new_cafe.app.backend.menu.adapter.out.jpa.MenuImageJpaRepository;

import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class AdminMenuImagePersistenceAdapter implements AdminMenuImageRepositoryPort {

    private final MenuImageJpaRepository menuImageJpaRepository;

    public AdminMenuImagePersistenceAdapter(MenuImageJpaRepository menuImageJpaRepository) {
        this.menuImageJpaRepository = menuImageJpaRepository;
    }

    @Override
    public List<AdminMenuImage> findAllByMenuId(Long menuId) {
        List<MenuImageEntity> entities = menuImageJpaRepository.findAllByMenuIdOrderBySortOrderAsc(menuId);
        return entities.stream()
            .map(this::toAdminMenuImage)
            .collect(Collectors.toList());
    }

    @Override
    public AdminMenuImage findById(Long id) {
        if (id == null) return null;
        return menuImageJpaRepository.findById(id)
            .map(this::toAdminMenuImage)
            .orElse(null);
    }

    private AdminMenuImage toAdminMenuImage(MenuImageEntity e) {
        return AdminMenuImage.builder()
            .id(e.getId())
            .menuId(e.getMenuId())
            .imageSrc(e.getImageSrc())
            .sortOrder(e.getSortOrder())
            .build();
    }

    @Override
    public AdminMenuImage save(AdminMenuImage image) {
        int sortOrder = image.getSortOrder() != null ? image.getSortOrder() : 0;
        MenuImageEntity saved;
        if (image.getId() != null) {
            MenuImageEntity existing = menuImageJpaRepository.findById(image.getId()).orElse(null);
            if (existing != null) {
                existing.setSortOrder(sortOrder);
                saved = menuImageJpaRepository.save(existing);
            } else {
                saved = menuImageJpaRepository.save(MenuImageEntity.builder()
                    .id(null)
                    .menuId(image.getMenuId())
                    .imageSrc(image.getImageSrc())
                    .createdAt(LocalDateTime.now())
                    .sortOrder(sortOrder)
                    .build());
            }
        } else {
            saved = menuImageJpaRepository.save(MenuImageEntity.builder()
                .id(null)
                .menuId(image.getMenuId())
                .imageSrc(image.getImageSrc())
                .createdAt(LocalDateTime.now())
                .sortOrder(sortOrder)
                .build());
        }
        return toAdminMenuImage(saved);
    }
}
