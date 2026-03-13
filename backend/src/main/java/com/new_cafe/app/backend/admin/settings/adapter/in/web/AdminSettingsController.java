package com.new_cafe.app.backend.admin.settings.adapter.in.web;

import com.new_cafe.app.backend.admin.settings.adapter.out.jpa.SiteSettingEntity;
import com.new_cafe.app.backend.admin.settings.adapter.out.jpa.SiteSettingJpaRepository;
import com.new_cafe.app.backend.auth.adapter.out.jwt.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/settings")
public class AdminSettingsController {

    private final SiteSettingJpaRepository siteSettingJpaRepository;
    private final JwtService jwtService;

    public AdminSettingsController(SiteSettingJpaRepository siteSettingJpaRepository, JwtService jwtService) {
        this.siteSettingJpaRepository = siteSettingJpaRepository;
        this.jwtService = jwtService;
    }

    @GetMapping
    public ResponseEntity<Map<String, String>> get(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        List<SiteSettingEntity> list = siteSettingJpaRepository.findAllByOrderByKeyAsc();
        Map<String, String> body = list.stream()
                .collect(Collectors.toMap(SiteSettingEntity::getKey, e -> e.getValue() != null ? e.getValue() : ""));
        return ResponseEntity.ok(body);
    }

    @PutMapping
    public ResponseEntity<Map<String, String>> update(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody Map<String, String> payload
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        if (payload == null || payload.isEmpty()) return ResponseEntity.badRequest().build();

        LocalDateTime now = LocalDateTime.now();
        for (Map.Entry<String, String> entry : payload.entrySet()) {
            String k = entry.getKey();
            if (k == null || k.isBlank()) continue;
            String v = entry.getValue() != null ? entry.getValue() : "";
            siteSettingJpaRepository.findById(k)
                    .map(e -> {
                        e.setValue(v);
                        e.setUpdatedAt(now);
                        return siteSettingJpaRepository.save(e);
                    })
                    .orElseGet(() -> siteSettingJpaRepository.save(SiteSettingEntity.builder()
                            .key(k.trim())
                            .value(v)
                            .updatedAt(now)
                            .build()));
        }

        List<SiteSettingEntity> list = siteSettingJpaRepository.findAllByOrderByKeyAsc();
        Map<String, String> body = list.stream()
                .collect(Collectors.toMap(SiteSettingEntity::getKey, e -> e.getValue() != null ? e.getValue() : ""));
        return ResponseEntity.ok(body);
    }

    private boolean isAdmin(String authorization) {
        Claims claims = jwtService.parseToken(authorization);
        return claims != null && "ADMIN".equals(claims.get("role"));
    }
}
