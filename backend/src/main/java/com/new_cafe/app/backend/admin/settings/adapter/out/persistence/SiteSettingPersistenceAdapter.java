package com.new_cafe.app.backend.admin.settings.adapter.out.persistence;

import com.new_cafe.app.backend.admin.settings.application.port.out.SiteSettingRepositoryPort;
import com.new_cafe.app.backend.admin.settings.adapter.out.jpa.SiteSettingEntity;
import com.new_cafe.app.backend.admin.settings.adapter.out.jpa.SiteSettingJpaRepository;
import com.new_cafe.app.backend.admin.settings.model.SiteSetting;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class SiteSettingPersistenceAdapter implements SiteSettingRepositoryPort {

    private final SiteSettingJpaRepository siteSettingJpaRepository;

    public SiteSettingPersistenceAdapter(SiteSettingJpaRepository siteSettingJpaRepository) {
        this.siteSettingJpaRepository = siteSettingJpaRepository;
    }

    @Override
    public List<SiteSetting> findAllByOrderByKeyAsc() {
        return siteSettingJpaRepository.findAllByOrderByKeyAsc().stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<SiteSetting> findByKey(String key) {
        return siteSettingJpaRepository.findById(key).map(this::toModel);
    }

    @Override
    public SiteSetting save(SiteSetting setting) {
        SiteSettingEntity entity = toEntity(setting);
        SiteSettingEntity saved = siteSettingJpaRepository.save(entity);
        return toModel(saved);
    }

    private SiteSetting toModel(SiteSettingEntity e) {
        return SiteSetting.builder()
                .key(e.getKey())
                .value(e.getValue())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private SiteSettingEntity toEntity(SiteSetting m) {
        return SiteSettingEntity.builder()
                .key(m.getKey())
                .value(m.getValue())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
