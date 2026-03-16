package com.new_cafe.app.backend.admin.inquiry.adapter.in.web;

import com.new_cafe.app.backend.auth.adapter.out.jwt.JwtService;
import com.new_cafe.app.backend.auth.application.port.out.MemberRepositoryPort;
import com.new_cafe.app.backend.auth.model.Member;
import com.new_cafe.app.backend.inquiry.application.port.in.InquiryUseCase;
import com.new_cafe.app.backend.inquiry.model.Inquiry;
import com.new_cafe.app.backend.inquiry.model.InquiryReply;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import io.jsonwebtoken.Claims;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/inquiries")
public class AdminInquiryController {

    private final InquiryUseCase inquiryUseCase;
    private final JwtService jwtService;
    private final MemberRepositoryPort memberRepositoryPort;

    public AdminInquiryController(InquiryUseCase inquiryUseCase, JwtService jwtService,
                                  MemberRepositoryPort memberRepositoryPort) {
        this.inquiryUseCase = inquiryUseCase;
        this.jwtService = jwtService;
        this.memberRepositoryPort = memberRepositoryPort;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String inquiryType,
            @RequestParam(required = false) Boolean hasReply,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        List<Inquiry> list = inquiryUseCase.listForAdmin(search, inquiryType, fromDate, toDate);
        List<Map<String, Object>> withHasReply = list.stream().map(inq -> {
            Map<String, Object> m = inquiryToMap(inq);
            boolean replied = inquiryUseCase.countRepliesByInquiryId(inq.getId()) > 0;
            m.put("hasReply", replied);
            String authorName = resolveAuthorName(inq.getUserId());
            m.put("authorName", authorName);
            return m;
        }).collect(Collectors.toList());
        if (hasReply != null) {
            withHasReply = withHasReply.stream()
                .filter(m -> hasReply.equals(m.get("hasReply")))
                .collect(Collectors.toList());
        }
        return ResponseEntity.ok(withHasReply);
    }

    @PostMapping("/bulk-delete")
    public ResponseEntity<Void> bulkDelete(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody Map<String, List<Long>> body
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        List<Long> ids = body != null ? body.get("ids") : null;
        if (ids == null || ids.isEmpty()) return ResponseEntity.badRequest().build();
        inquiryUseCase.deleteByIds(ids);
        return ResponseEntity.noContent().build();
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        if (inquiryUseCase.findById(id).isEmpty()) return ResponseEntity.notFound().build();
        inquiryUseCase.deleteById(id);
        return ResponseEntity.noContent().build();
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

    private String resolveAuthorName(Long userId) {
        if (userId == null) return "—";
        Optional<Member> opt = memberRepositoryPort.findById(userId);
        if (opt.isEmpty()) return "—";
        Member m = opt.get();
        if (m.getDisplayNickname() != null && !m.getDisplayNickname().isBlank()) return m.getDisplayNickname();
        if (m.getName() != null && !m.getName().isBlank()) return m.getName();
        if (m.getUsername() != null && !m.getUsername().isBlank()) return m.getUsername();
        return "—";
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
        m.put("createdAt", r.getCreatedAt());
        return m;
    }
}
