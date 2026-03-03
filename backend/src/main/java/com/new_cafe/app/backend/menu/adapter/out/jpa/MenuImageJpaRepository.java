package com.new_cafe.app.backend.menu.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MenuImageJpaRepository extends JpaRepository<MenuImageEntity, Long> {
    List<MenuImageEntity> findAllByMenuIdOrderBySortOrderAsc(Long menuId);
}
