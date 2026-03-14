package com.new_cafe.app.backend.admin.settings.adapter.in.web;

import com.new_cafe.app.backend.admin.settings.application.port.in.GetPublicSettingsUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** 인증 없이 조회 가능한 사이트 설정 (카페명, 영업시간, 연락처 등) */
@RestController
@RequestMapping("/api/settings")
public class PublicSettingsController {

    private final GetPublicSettingsUseCase getPublicSettingsUseCase;

    public PublicSettingsController(GetPublicSettingsUseCase getPublicSettingsUseCase) {
        this.getPublicSettingsUseCase = getPublicSettingsUseCase;
    }

    @GetMapping
    public ResponseEntity<Map<String, String>> get() {
        return ResponseEntity.ok(getPublicSettingsUseCase.getSettings());
    }
}
