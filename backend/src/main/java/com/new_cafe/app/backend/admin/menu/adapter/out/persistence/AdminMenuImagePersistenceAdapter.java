package com.new_cafe.app.backend.admin.menu.adapter.out.persistence;

import com.new_cafe.app.backend.admin.menu.application.port.out.AdminMenuImageRepositoryPort;
import com.new_cafe.app.backend.admin.menu.model.AdminMenuImage;
import com.new_cafe.app.backend.menu.adapter.out.jpa.MenuImageEntity;
import com.new_cafe.app.backend.menu.adapter.out.jpa.MenuImageJpaRepository;

import org.springframework.stereotype.Repository;
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
            .map(e -> AdminMenuImage.builder()
                .id(e.getId())
                .menuId(e.getMenuId())
                .imageSrc(e.getImageSrc())
                .sortOrder(e.getSortOrder())
                .build())
            .collect(Collectors.toList());
    }
}
