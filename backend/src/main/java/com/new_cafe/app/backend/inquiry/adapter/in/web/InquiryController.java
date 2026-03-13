package com.new_cafe.app.backend.inquiry.adapter.in.web;

import com.new_cafe.app.backend.inquiry.application.service.InquiryService;
import com.new_cafe.app.backend.inquiry.adapter.out.jpa.InquiryEntity;
import com.new_cafe.app.backend.inquiry.adapter.out.jpa.InquiryReplyEntity;
import com.new_cafe.app.backend.inquiry.adapter.out.jpa.InquiryReplyJpaRepository;
import io.jsonwebtoken.Claims;
import com.new_cafe.app.backend.auth.adapter.out.jwt.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inquiries")
public class InquiryController {

    private final InquiryService inquiryService;
    private final JwtService jwtService;
    private final InquiryReplyJpaRepository inquiryReplyJpaRepository;

    public InquiryController(InquiryService inquiryService, JwtService jwtService, InquiryReplyJpaRepository inquiryReplyJpaRepository) {
        this.inquiryService = inquiryService;
        this.jwtService = jwtService;
        this.inquiryReplyJpaRepository = inquiryReplyJpaRepository;
    }

    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> myList(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        Long userId = getUserIdOrNull(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        List<InquiryEntity> list = inquiryService.findByUserId(userId);
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
        Long userId = getUserIdOrNull(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        Optional<InquiryEntity> opt = inquiryService.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        InquiryEntity inquiry = opt.get();
        if (!userId.equals(inquiry.getUserId())) {
            return ResponseEntity.status(403).build();
        }
        Map<String, Object> m = inquiryToMap(inquiry);
        List<InquiryReplyEntity> replies = inquiryService.getReplies(id);
        m.put("replies", replies.stream().map(this::replyToMap).collect(Collectors.toList()));
        return ResponseEntity.ok(m);
    }

    /** 사용자 대댓글 추가 (관리자 답변에 대한 댓글) */
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
            InquiryReplyEntity reply = inquiryService.addUserReply(id, userId, content.trim(), parentReplyId);
            return ResponseEntity.ok(replyToMap(reply));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /** 사용자 대댓글 수정 */
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
            InquiryReplyEntity reply = inquiryService.updateUserReply(replyId, userId, content.trim());
            return ResponseEntity.ok(replyToMap(reply));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(null);
        }
    }

    /** 사용자 대댓글 삭제 */
    @DeleteMapping("/replies/{replyId}")
    public ResponseEntity<Void> deleteReply(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long replyId
    ) {
        Long userId = getUserIdOrNull(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        try {
            inquiryService.deleteUserReply(replyId, userId);
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
        String title = (String) body.get("title");
        String content = body.get("content") != null ? (String) body.get("content") : "";
        boolean isPrivate = Boolean.TRUE.equals(body.get("isPrivate"));
        if (title == null || title.isBlank()) return ResponseEntity.badRequest().build();
        InquiryEntity inquiry = inquiryService.create(userId, title, content, isPrivate);
        return ResponseEntity.ok(inquiryToMap(inquiry));
    }

    private Long getUserIdOrNull(String authorization) {
        Claims claims = jwtService.parseToken(authorization);
        if (claims == null) return null;
        return Long.parseLong(claims.getSubject());
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
        m.put("parentReplyId", r.getParentReplyId());
        m.put("createdAt", r.getCreatedAt());
        return m;
    }
}
