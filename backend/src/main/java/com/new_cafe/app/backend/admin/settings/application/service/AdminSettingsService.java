package com.new_cafe.app.backend.admin.settings.application.service;

import com.new_cafe.app.backend.admin.settings.application.port.in.AdminSettingsUseCase;
import com.new_cafe.app.backend.admin.settings.application.port.in.GetPublicSettingsUseCase;
import com.new_cafe.app.backend.admin.settings.application.port.out.SiteSettingRepositoryPort;
import com.new_cafe.app.backend.admin.settings.model.SiteSetting;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminSettingsService implements AdminSettingsUseCase, GetPublicSettingsUseCase {

    private final SiteSettingRepositoryPort siteSettingRepository;

    public AdminSettingsService(SiteSettingRepositoryPort siteSettingRepository) {
        this.siteSettingRepository = siteSettingRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, String> getSettings() {
        List<SiteSetting> list = siteSettingRepository.findAllByOrderByKeyAsc();
        return list.stream()
                .collect(Collectors.toMap(SiteSetting::getKey, e -> e.getValue() != null ? e.getValue() : ""));
    }

    @Override
    @Transactional
    public Map<String, String> updateSettings(Map<String, String> payload) {
        if (payload == null || payload.isEmpty()) {
            return getSettings();
        }
        LocalDateTime now = LocalDateTime.now();
        for (Map.Entry<String, String> entry : payload.entrySet()) {
            String k = entry.getKey();
            if (k == null || k.isBlank()) continue;
            String v = entry.getValue() != null ? entry.getValue() : "";
            siteSettingRepository.save(SiteSetting.builder()
                    .key(k.trim())
                    .value(v)
                    .updatedAt(now)
                    .build());
        }
        return getSettings();
    }
}
