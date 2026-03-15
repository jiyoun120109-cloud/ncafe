package com.new_cafe.app.backend.category.adapter.in.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 카테고리 아이콘 파일 조회 (비인증 허용)
 */
@RestController
@RequestMapping("/api/categories/files")
public class CategoryFileController {

    @Value("${app.upload.dir:./upload}")
    private String uploadDir;

    private static final String CATEGORY_SUBDIR = "category";

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        if (filename == null || filename.contains("..") || filename.contains("/")) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Path dir = Paths.get(uploadDir.replaceFirst("^file:", "").trim(), CATEGORY_SUBDIR).toAbsolutePath().normalize();
            Path file = dir.resolve(filename).normalize();
            if (!file.startsWith(dir) || !Files.exists(file)) {
                return ResponseEntity.notFound().build();
            }
            Resource resource = new UrlResource(file.toUri());
            String contentType = Files.probeContentType(file);
            if (contentType == null) contentType = "application/octet-stream";
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
