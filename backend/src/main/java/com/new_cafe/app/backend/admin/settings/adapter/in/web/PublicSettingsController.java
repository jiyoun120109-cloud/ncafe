package com.new_cafe.app.backend.admin.settings.adapter.in.web;

import com.new_cafe.app.backend.admin.settings.adapter.out.jpa.SiteSettingEntity;
import com.new_cafe.app.backend.admin.settings.adapter.out.jpa.SiteSettingJpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** 인증 없이 조회 가능한 사이트 설정 (카페명, 영업시간, 연락처 등) */
@RestController
@RequestMapping("/api/settings")
public class PublicSettingsController {

    private final SiteSettingJpaRepository siteSettingJpaRepository;

    public PublicSettingsController(SiteSettingJpaRepository siteSettingJpaRepository) {
        this.siteSettingJpaRepository = siteSettingJpaRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, String>> get() {
        List<SiteSettingEntity> list = siteSettingJpaRepository.findAllByOrderByKeyAsc();
        Map<String, String> body = list.stream()
                .collect(Collectors.toMap(SiteSettingEntity::getKey, e -> e.getValue() != null ? e.getValue() : ""));
        return ResponseEntity.ok(body);
    }
}
