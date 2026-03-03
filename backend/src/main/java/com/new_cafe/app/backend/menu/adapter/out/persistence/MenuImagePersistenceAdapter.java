package com.new_cafe.app.backend.menu.adapter.out.persistence;

import com.new_cafe.app.backend.menu.application.port.out.MenuImageRepositoryPort;
import com.new_cafe.app.backend.menu.model.MenuImage;
import com.new_cafe.app.backend.menu.adapter.out.jpa.MenuImageEntity;
import com.new_cafe.app.backend.menu.adapter.out.jpa.MenuImageJpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class MenuImagePersistenceAdapter implements MenuImageRepositoryPort {

    private final MenuImageJpaRepository menuImageJpaRepository;

    public MenuImagePersistenceAdapter(MenuImageJpaRepository menuImageJpaRepository) {
        this.menuImageJpaRepository = menuImageJpaRepository;
    }

    @Override
    public List<MenuImage> findAllByMenuId(Long menuId) {
        List<MenuImageEntity> entities = menuImageJpaRepository.findAllByMenuIdOrderBySortOrderAsc(menuId);
        return entities.stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public MenuImage save(MenuImage menuImage) {
        MenuImageEntity entity = toEntity(menuImage);
        MenuImageEntity saved = menuImageJpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public void deleteAllByMenuId(Long menuId) {
        List<MenuImageEntity> entities = menuImageJpaRepository.findAllByMenuIdOrderBySortOrderAsc(menuId);
        menuImageJpaRepository.deleteAll(entities);
    }

    private MenuImage toDomain(MenuImageEntity e) {
        return MenuImage.builder()
                .id(e.getId())
                .menuId(e.getMenuId())
                .imageSrc(e.getImageSrc())
                .sortOrder(e.getSortOrder())
                .createdAt(e.getCreatedAt())
                .build();
    }

    private MenuImageEntity toEntity(MenuImage d) {
        return MenuImageEntity.builder()
                .id(d.getId())
                .menuId(d.getMenuId())
                .imageSrc(d.getImageSrc())
                .sortOrder(d.getSortOrder())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
