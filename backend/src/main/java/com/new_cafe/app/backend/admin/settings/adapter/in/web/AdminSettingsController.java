package com.new_cafe.app.backend.admin.settings.adapter.in.web;

import com.new_cafe.app.backend.admin.settings.application.port.in.AdminSettingsUseCase;
import com.new_cafe.app.backend.auth.adapter.out.jwt.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
public class AdminSettingsController {

    private final AdminSettingsUseCase adminSettingsUseCase;
    private final JwtService jwtService;

    public AdminSettingsController(AdminSettingsUseCase adminSettingsUseCase, JwtService jwtService) {
        this.adminSettingsUseCase = adminSettingsUseCase;
        this.jwtService = jwtService;
    }

    @GetMapping
    public ResponseEntity<Map<String, String>> get(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(adminSettingsUseCase.getSettings());
    }

    @PutMapping
    public ResponseEntity<Map<String, String>> update(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody Map<String, String> payload
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        if (payload == null || payload.isEmpty()) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(adminSettingsUseCase.updateSettings(payload));
    }

    private boolean isAdmin(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return false;
        Claims claims = jwtService.parseToken(authorization);
        return claims != null && "ADMIN".equals(claims.get("role"));
    }
}
