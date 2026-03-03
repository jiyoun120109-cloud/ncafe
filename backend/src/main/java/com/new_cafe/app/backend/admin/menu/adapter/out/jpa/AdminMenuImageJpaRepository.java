package com.new_cafe.app.backend.admin.menu.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminMenuImageJpaRepository extends JpaRepository<AdminMenuImageEntity, Long> {
    List<AdminMenuImageEntity> findAllByMenuIdOrderBySortOrderAsc(Long menuId);
}
