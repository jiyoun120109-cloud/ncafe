package com.new_cafe.app.backend.admin.settings.application.port.in;

import java.util.Map;

public interface AdminSettingsUseCase {

    Map<String, String> getSettings();

    Map<String, String> updateSettings(Map<String, String> payload);
}
