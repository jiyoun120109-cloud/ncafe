package com.new_cafe.app.backend.admin.settings.application.port.out;

import com.new_cafe.app.backend.admin.settings.model.SiteSetting;

import java.util.List;
import java.util.Optional;

public interface SiteSettingRepositoryPort {

    List<SiteSetting> findAllByOrderByKeyAsc();

    Optional<SiteSetting> findByKey(String key);

    SiteSetting save(SiteSetting setting);
}
