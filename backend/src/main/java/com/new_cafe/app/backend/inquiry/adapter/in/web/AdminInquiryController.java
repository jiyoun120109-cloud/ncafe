package com.new_cafe.app.backend.inquiry.adapter.in.web;

import com.new_cafe.app.backend.inquiry.application.service.InquiryService;
import com.new_cafe.app.backend.inquiry.adapter.out.jpa.InquiryEntity;
import com.new_cafe.app.backend.inquiry.adapter.out.jpa.InquiryReplyEntity;
import io.jsonwebtoken.Claims;
import com.new_cafe.app.backend.auth.adapter.out.jwt.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/inquiries")
public class AdminInquiryController {

    private final InquiryService inquiryService;
    private final com.new_cafe.app.backend.inquiry.adapter.out.jpa.InquiryJpaRepository inquiryJpaRepository;
    private final com.new_cafe.app.backend.inquiry.adapter.out.jpa.InquiryReplyJpaRepository inquiryReplyJpaRepository;
    private final JwtService jwtService;

    public AdminInquiryController(InquiryService inquiryService,
                                  com.new_cafe.app.backend.inquiry.adapter.out.jpa.InquiryJpaRepository inquiryJpaRepository,
                                  com.new_cafe.app.backend.inquiry.adapter.out.jpa.InquiryReplyJpaRepository inquiryReplyJpaRepository,
                                  JwtService jwtService) {
        this.inquiryService = inquiryService;
        this.inquiryJpaRepository = inquiryJpaRepository;
        this.inquiryReplyJpaRepository = inquiryReplyJpaRepository;
        this.jwtService = jwtService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        List<InquiryEntity> list = inquiryJpaRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(list.stream().map(inq -> {
            Map<String, Object> m = inquiryToMap(inq);
            m.put("hasReply", inquiryReplyJpaRepository.countByInquiry_Id(inq.getId()) > 0);
            return m;
        }).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> get(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        return inquiryService.findById(id)
                .map(inquiry -> {
                    Map<String, Object> m = inquiryToMap(inquiry);
                    m.put("replies", inquiryService.getReplies(id).stream().map(this::replyToMap).collect(Collectors.toList()));
                    return ResponseEntity.<Map<String, Object>>ok(m);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/replies")
    public ResponseEntity<Map<String, Object>> addReply(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        Claims claims = jwtService.parseToken(authorization);
        Long authorId = claims != null ? Long.parseLong(claims.getSubject()) : null;
        String content = body.get("content");
        if (content == null || content.isBlank()) return ResponseEntity.badRequest().build();
        InquiryReplyEntity reply = inquiryService.addReply(id, content, authorId);
        return ResponseEntity.ok(replyToMap(reply));
    }

    private boolean isAdmin(String authorization) {
        Claims claims = jwtService.parseToken(authorization);
        return claims != null && "ADMIN".equals(claims.get("role"));
    }

    private Map<String, Object> inquiryToMap(InquiryEntity i) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", i.getId());
        m.put("userId", i.getUserId());
        m.put("title", i.getTitle());
        m.put("content", i.getContent());
        m.put("isPrivate", i.getIsPrivate());
        m.put("createdAt", i.getCreatedAt());
        m.put("updatedAt", i.getUpdatedAt());
        return m;
    }

    private Map<String, Object> replyToMap(InquiryReplyEntity r) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", r.getId());
        m.put("content", r.getContent());
        m.put("authorId", r.getAuthorId());
        m.put("createdAt", r.getCreatedAt());
        return m;
    }
}
