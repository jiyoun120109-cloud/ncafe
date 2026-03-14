package com.new_cafe.app.backend.inquiry.adapter.in.web;

import com.new_cafe.app.backend.inquiry.application.port.in.InquiryUseCase;
import com.new_cafe.app.backend.inquiry.model.Inquiry;
import com.new_cafe.app.backend.inquiry.model.InquiryReply;
import com.new_cafe.app.backend.auth.adapter.out.jwt.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inquiries")
public class InquiryController {

    private final InquiryUseCase inquiryUseCase;
    private final JwtService jwtService;

    @Value("${app.upload.dir:./upload}")
    private String uploadDir;

    public InquiryController(InquiryUseCase inquiryUseCase, JwtService jwtService) {
        this.inquiryUseCase = inquiryUseCase;
        this.jwtService = jwtService;
    }

    /** 문의 첨부파일 업로드. 반환된 attachmentUrl을 create 시 전달. */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadAttachment(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        Long userId = getUserIdOrNull(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        if (file == null || file.isEmpty()) return ResponseEntity.badRequest().build();
        long maxSize = 5 * 1024 * 1024; // 5MB
        if (file.getSize() > maxSize) {
            return ResponseEntity.badRequest().body(Map.of("error", "파일 크기는 5MB 이하여야 합니다."));
        }
        String originalName = file.getOriginalFilename();
        String ext = (originalName != null && originalName.contains("."))
                ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase()
                : "";
        String safeExt = ext.matches("\\.[a-z0-9]+") ? ext : ".bin";
        Path dir = Paths.get(uploadDir.replaceFirst("^file:", "").trim(), "inquiry").toAbsolutePath().normalize();
        if (!Files.exists(dir)) Files.createDirectories(dir);
        String filename = UUID.randomUUID().toString() + safeExt;
        Path target = dir.resolve(filename);
        file.transferTo(target);
        String relativePath = "inquiry/" + filename;
        return ResponseEntity.ok(Map.of("attachmentUrl", relativePath));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> myList(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        Long userId = getUserIdOrNull(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        List<Inquiry> list = inquiryUseCase.findByUserId(userId);
        return ResponseEntity.ok(list.stream().map(inq -> {
            Map<String, Object> m = inquiryToMap(inq);
            m.put("hasReply", inquiryUseCase.countRepliesByInquiryId(inq.getId()) > 0);
            return m;
        }).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> get(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id
    ) {
        Long userId = getUserIdOrNull(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        Optional<Inquiry> opt = inquiryUseCase.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Inquiry inquiry = opt.get();
        if (!userId.equals(inquiry.getUserId())) {
            return ResponseEntity.status(403).build();
        }
        Map<String, Object> m = inquiryToMap(inquiry);
        List<InquiryReply> replies = inquiryUseCase.getReplies(id);
        m.put("replies", replies.stream().map(this::replyToMap).collect(Collectors.toList()));
        return ResponseEntity.ok(m);
    }

    @PostMapping("/{id}/replies")
    public ResponseEntity<Map<String, Object>> addReply(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        Long userId = getUserIdOrNull(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        String content = body.get("content") != null ? body.get("content").toString() : "";
        Object pr = body.get("parentReplyId");
        Long parentReplyId = pr != null && !pr.toString().isBlank() ? Long.parseLong(pr.toString()) : null;
        if (content.isBlank() || parentReplyId == null) return ResponseEntity.badRequest().build();
        try {
            InquiryReply reply = inquiryUseCase.addUserReply(id, userId, content.trim(), parentReplyId);
            return ResponseEntity.ok(replyToMap(reply));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/replies/{replyId}")
    public ResponseEntity<Map<String, Object>> updateReply(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long replyId,
            @RequestBody Map<String, Object> body
    ) {
        Long userId = getUserIdOrNull(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        String content = body.get("content") != null ? body.get("content").toString() : "";
        if (content.isBlank()) return ResponseEntity.badRequest().build();
        try {
            InquiryReply reply = inquiryUseCase.updateUserReply(replyId, userId, content.trim());
            return ResponseEntity.ok(replyToMap(reply));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(null);
        }
    }

    @DeleteMapping("/replies/{replyId}")
    public ResponseEntity<Void> deleteReply(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long replyId
    ) {
        Long userId = getUserIdOrNull(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        try {
            inquiryUseCase.deleteUserReply(replyId, userId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id
    ) {
        Long userId = getUserIdOrNull(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        try {
            inquiryUseCase.deleteByUser(id, userId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).build();
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody Map<String, Object> body
    ) {
        Long userId = getUserIdOrNull(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        String inquiryType = body.get("inquiryType") != null ? body.get("inquiryType").toString().trim() : null;
        String title = (String) body.get("title");
        String content = body.get("content") != null ? (String) body.get("content") : "";
        boolean isPrivate = Boolean.TRUE.equals(body.get("isPrivate"));
        String attachmentUrl = body.get("attachmentUrl") != null ? body.get("attachmentUrl").toString().trim() : null;
        if (title == null || title.isBlank()) return ResponseEntity.badRequest().build();
        Inquiry inquiry = inquiryUseCase.create(userId, inquiryType, title, content, isPrivate, attachmentUrl);
        return ResponseEntity.ok(inquiryToMap(inquiry));
    }

    private Long getUserIdOrNull(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return null;
        return jwtService.getUserIdFromClaims(jwtService.parseToken(authorization));
    }

    private Map<String, Object> inquiryToMap(Inquiry i) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", i.getId());
        m.put("userId", i.getUserId());
        m.put("inquiryType", i.getInquiryType());
        m.put("title", i.getTitle());
        m.put("content", i.getContent());
        m.put("isPrivate", i.getIsPrivate());
        m.put("attachmentUrl", i.getAttachmentUrl());
        m.put("createdAt", i.getCreatedAt());
        m.put("updatedAt", i.getUpdatedAt());
        return m;
    }

    private Map<String, Object> replyToMap(InquiryReply r) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", r.getId());
        m.put("content", r.getContent());
        m.put("authorId", r.getAuthorId());
        m.put("parentReplyId", r.getParentReplyId());
        m.put("createdAt", r.getCreatedAt());
        return m;
    }
}
