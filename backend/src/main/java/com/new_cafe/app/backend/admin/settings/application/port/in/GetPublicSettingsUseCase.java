package com.new_cafe.app.backend.admin.settings.application.port.in;

import java.util.Map;

/** 인증 없이 조회 가능한 사이트 설정 (카페명, 영업시간 등) */
public interface GetPublicSettingsUseCase {

    Map<String, String> getSettings();
}
