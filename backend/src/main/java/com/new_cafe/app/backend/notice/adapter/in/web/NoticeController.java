package com.new_cafe.app.backend.notice.adapter.in.web;

import com.new_cafe.app.backend.notice.application.service.NoticeService;
import com.new_cafe.app.backend.notice.adapter.out.jpa.NoticeEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 사용자 공개 공지사항 API (목록/상세 조회).
 * 관리자 등록·수정은 /api/admin/notices 사용.
 */
@RestController
@RequestMapping("/api/notices")
public class NoticeController {

    private final NoticeService noticeService;

    public NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list() {
        List<NoticeEntity> list = noticeService.findAll();
        List<Map<String, Object>> body = list.stream().map(this::toMap).collect(Collectors.toList());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable Long id) {
        return noticeService.findByIdAndIncrementViewCount(id)
                .map(n -> ResponseEntity.ok(toMap(n)))
                .orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> toMap(NoticeEntity n) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", n.getId());
        m.put("noticeType", n.getNoticeType());
        m.put("title", n.getTitle());
        m.put("content", n.getContent());
        m.put("authorId", n.getAuthorId());
        m.put("viewCount", n.getViewCount() != null ? n.getViewCount() : 0);
        m.put("createdAt", n.getCreatedAt());
        m.put("updatedAt", n.getUpdatedAt());
        return m;
    }
}
