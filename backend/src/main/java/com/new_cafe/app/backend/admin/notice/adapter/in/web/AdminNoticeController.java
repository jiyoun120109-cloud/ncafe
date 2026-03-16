package com.new_cafe.app.backend.admin.notice.adapter.in.web;

import com.new_cafe.app.backend.admin.notice.application.command.*;
import com.new_cafe.app.backend.admin.notice.application.port.in.AdminNoticeUseCase;
import com.new_cafe.app.backend.admin.notice.application.result.NoticeDetailResult;
import com.new_cafe.app.backend.admin.notice.application.result.NoticeListResult;
import com.new_cafe.app.backend.admin.notice.adapter.in.web.dto.req.CreateNoticeRequestDto;
import com.new_cafe.app.backend.admin.notice.adapter.in.web.dto.req.UpdateNoticeRequestDto;
import com.new_cafe.app.backend.admin.notice.adapter.in.web.dto.res.NoticeDetailResponseDto;
import com.new_cafe.app.backend.admin.notice.adapter.in.web.dto.res.NoticeListResponseDto;
import com.new_cafe.app.backend.auth.adapter.out.jwt.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/notices")
public class AdminNoticeController {

    private final AdminNoticeUseCase adminNoticeUseCase;
    private final JwtService jwtService;

    public AdminNoticeController(AdminNoticeUseCase adminNoticeUseCase, JwtService jwtService) {
        this.adminNoticeUseCase = adminNoticeUseCase;
        this.jwtService = jwtService;
    }

    @GetMapping
    public ResponseEntity<NoticeListResponseDto> list(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String noticeType,
            @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate toDate
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        NoticeListCommand command = NoticeListCommand.builder()
                .page(page)
                .size(size)
                .search(search)
                .noticeType(noticeType)
                .fromDate(fromDate)
                .toDate(toDate)
                .build();
        NoticeListResult result = adminNoticeUseCase.getNoticeList(command);
        return ResponseEntity.ok(NoticeListResponseDto.from(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NoticeDetailResponseDto> get(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean incrementView
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        GetNoticeCommand command = GetNoticeCommand.builder()
                .id(id)
                .incrementView(incrementView)
                .build();
        Optional<NoticeDetailResult> opt = adminNoticeUseCase.getNotice(command);
        return opt.map(r -> ResponseEntity.ok(NoticeDetailResponseDto.from(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/prev")
    public ResponseEntity<NoticeDetailResponseDto> prev(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        return adminNoticeUseCase.getPrev(id)
                .map(r -> ResponseEntity.ok(NoticeDetailResponseDto.from(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/next")
    public ResponseEntity<NoticeDetailResponseDto> next(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        return adminNoticeUseCase.getNext(id)
                .map(r -> ResponseEntity.ok(NoticeDetailResponseDto.from(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<NoticeDetailResponseDto> create(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody CreateNoticeRequestDto body
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        if (body.getTitle() == null || body.getTitle().isBlank()) return ResponseEntity.badRequest().build();
        Long authorId = getAuthorId(authorization);
        CreateNoticeCommand command = CreateNoticeCommand.builder()
                .noticeType(body.getNoticeType())
                .title(body.getTitle())
                .content(body.getContent() != null ? body.getContent() : "")
                .authorId(authorId)
                .isPinned(body.getIsPinned())
                .build();
        NoticeDetailResult notice = adminNoticeUseCase.createNotice(command);
        return ResponseEntity.ok(NoticeDetailResponseDto.from(notice));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoticeDetailResponseDto> update(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @RequestBody UpdateNoticeRequestDto body
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        UpdateNoticeCommand command = UpdateNoticeCommand.builder()
                .id(id)
                .noticeType(body.getNoticeType())
                .title(body.getTitle())
                .content(body.getContent())
                .isPinned(body.getIsPinned())
                .build();
        Optional<NoticeDetailResult> opt = adminNoticeUseCase.updateNotice(command);
        return opt.map(r -> ResponseEntity.ok(NoticeDetailResponseDto.from(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/pin")
    public ResponseEntity<NoticeDetailResponseDto> togglePin(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        return adminNoticeUseCase.togglePin(id)
                .map(r -> ResponseEntity.ok(NoticeDetailResponseDto.from(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        adminNoticeUseCase.deleteNotice(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/delete")
    public ResponseEntity<Void> deleteBatch(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody List<Long> ids
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        if (ids == null || ids.isEmpty()) return ResponseEntity.badRequest().build();
        adminNoticeUseCase.deleteNotices(ids);
        return ResponseEntity.noContent().build();
    }

    private boolean isAdmin(String authorization) {
        Claims claims = jwtService.parseToken(authorization);
        return claims != null && "ADMIN".equals(claims.get("role"));
    }

    private Long getAuthorId(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return null;
        return jwtService.getUserIdFromClaims(jwtService.parseToken(authorization));
    }
}
