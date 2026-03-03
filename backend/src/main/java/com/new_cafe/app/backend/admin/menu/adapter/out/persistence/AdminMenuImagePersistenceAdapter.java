package com.new_cafe.app.backend.admin.menu.adapter.out.persistence;

import com.new_cafe.app.backend.admin.menu.application.port.out.AdminMenuImageRepositoryPort;
import com.new_cafe.app.backend.admin.menu.model.AdminMenuImage;
import com.new_cafe.app.backend.admin.menu.adapter.out.jpa.AdminMenuImageEntity;
import com.new_cafe.app.backend.admin.menu.adapter.out.jpa.AdminMenuImageJpaRepository;

import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class AdminMenuImagePersistenceAdapter implements AdminMenuImageRepositoryPort {

    private final AdminMenuImageJpaRepository adminMenuImageJpaRepository;

    public AdminMenuImagePersistenceAdapter(AdminMenuImageJpaRepository adminMenuImageJpaRepository) {
        this.adminMenuImageJpaRepository = adminMenuImageJpaRepository;
    }

    @Override
    public List<AdminMenuImage> findAllByMenuId(Long menuId) {
        List<AdminMenuImageEntity> entities = adminMenuImageJpaRepository.findAllByMenuIdOrderBySortOrderAsc(menuId);

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
