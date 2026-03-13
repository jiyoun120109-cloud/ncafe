package com.new_cafe.app.backend.admin.settings.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SiteSettingJpaRepository extends JpaRepository<SiteSettingEntity, String> {
    List<SiteSettingEntity> findAllByOrderByKeyAsc();
}
