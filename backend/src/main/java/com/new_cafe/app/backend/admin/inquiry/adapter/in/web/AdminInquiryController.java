package com.new_cafe.app.backend.admin.inquiry.adapter.in.web;

import com.new_cafe.app.backend.auth.adapter.out.jwt.JwtService;
import com.new_cafe.app.backend.inquiry.application.port.in.InquiryUseCase;
import com.new_cafe.app.backend.inquiry.model.Inquiry;
import com.new_cafe.app.backend.inquiry.model.InquiryReply;
import org.springframework.http.ResponseEntity;
import io.jsonwebtoken.Claims;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/inquiries")
public class AdminInquiryController {

    private final InquiryUseCase inquiryUseCase;
    private final JwtService jwtService;

    public AdminInquiryController(InquiryUseCase inquiryUseCase, JwtService jwtService) {
        this.inquiryUseCase = inquiryUseCase;
        this.jwtService = jwtService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        List<Inquiry> list = inquiryUseCase.listAll();
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
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        return inquiryUseCase.findById(id)
                .map(inquiry -> {
                    Map<String, Object> m = inquiryToMap(inquiry);
                    m.put("replies", inquiryUseCase.getReplies(id).stream().map(this::replyToMap).collect(Collectors.toList()));
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
        Long authorId = jwtService.getUserIdFromClaims(jwtService.parseToken(authorization));
        String content = body.get("content");
        if (content == null || content.isBlank()) return ResponseEntity.badRequest().build();
        InquiryReply reply = inquiryUseCase.addReply(id, content, authorId);
        return ResponseEntity.ok(replyToMap(reply));
    }

    private boolean isAdmin(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return false;
        Claims claims = jwtService.parseToken(authorization);
        return claims != null && "ADMIN".equals(claims.get("role"));
    }

    private Map<String, Object> inquiryToMap(Inquiry i) {
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

    private Map<String, Object> replyToMap(InquiryReply r) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", r.getId());
        m.put("content", r.getContent());
        m.put("authorId", r.getAuthorId());
        m.put("createdAt", r.getCreatedAt());
        return m;
    }
}
