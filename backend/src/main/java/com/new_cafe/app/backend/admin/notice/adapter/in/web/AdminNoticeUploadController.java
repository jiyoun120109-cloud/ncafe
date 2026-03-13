package com.new_cafe.app.backend.admin.notice.adapter.in.web;

import com.new_cafe.app.backend.auth.adapter.out.jwt.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/notices")
public class AdminNoticeUploadController {

    private final JwtService jwtService;

    @Value("${app.upload.dir:./upload}")
    private String uploadDir;

    private static final String NOTICES_SUBDIR = "notices";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    public AdminNoticeUploadController(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> upload(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        if (!isAdmin(authorization)) {
            return ResponseEntity.status(403).build();
        }
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body(Map.of("error", "파일 크기는 10MB 이하여야 합니다."));
        }
        String originalName = file.getOriginalFilename();
        String ext = originalName != null && originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf("."))
                : "";
        String safeName = UUID.randomUUID().toString().replace("-", "") + sanitizeExt(ext);
        Path dir = Paths.get(uploadDir.replaceFirst("^file:", "").trim(), NOTICES_SUBDIR).toAbsolutePath().normalize();
        if (!Files.exists(dir)) {
            Files.createDirectories(dir);
        }
        Path target = dir.resolve(safeName);
        file.transferTo(target);
        String url = "/api/notices/files/" + safeName;
        return ResponseEntity.ok(new HashMap<>(Map.of("url", url, "filename", safeName)));
    }

    private String sanitizeExt(String ext) {
        if (ext == null || ext.length() > 10) return "";
        return ext.replaceAll("[^a-zA-Z0-9.]", "");
    }

    private boolean isAdmin(String authorization) {
        Claims claims = jwtService.parseToken(authorization);
        return claims != null && "ADMIN".equals(claims.get("role"));
    }
}
