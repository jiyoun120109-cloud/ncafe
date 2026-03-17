package com.new_cafe.app.backend.admin.member.adapter.in.web;

import com.new_cafe.app.backend.admin.member.adapter.in.web.dto.*;
import com.new_cafe.app.backend.admin.member.application.port.in.AdminMemberUseCase;
import com.new_cafe.app.backend.auth.adapter.out.jwt.JwtService;
import com.new_cafe.app.backend.auth.model.Member;
import io.jsonwebtoken.Claims;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/members")
public class AdminMemberController {

    private final AdminMemberUseCase adminMemberUseCase;
    private final JwtService jwtService;

    public AdminMemberController(AdminMemberUseCase adminMemberUseCase, JwtService jwtService) {
        this.adminMemberUseCase = adminMemberUseCase;
        this.jwtService = jwtService;
    }

    @GetMapping("/stats/role-counts")
    public ResponseEntity<Map<String, Long>> roleCounts(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        Map<String, Long> counts = adminMemberUseCase.getMemberRoleCounts(search, status, role, fromDate, toDate);
        return ResponseEntity.ok(counts);
    }

    @GetMapping
    public ResponseEntity<MemberPageResponseDto> list(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        Page<Member> result = adminMemberUseCase.getMemberList(page, size, search, status, role, fromDate, toDate);
        List<MemberListResponseDto> content = result.getContent().stream()
                .map(MemberListResponseDto::from)
                .collect(Collectors.toList());
        MemberPageResponseDto dto = MemberPageResponseDto.builder()
                .content(content)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .first(result.isFirst())
                .last(result.isLast())
                .build();
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MemberDetailWithActivityResponseDto> get(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        return adminMemberUseCase.getMemberDetailWithActivity(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/profile")
    public ResponseEntity<MemberDetailResponseDto> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @RequestBody UpdateMemberProfileRequestDto request
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        if (request == null) return ResponseEntity.badRequest().build();
        try {
            Member updated = adminMemberUseCase.updateMemberProfile(
                    id,
                    request.getDisplayNickname(),
                    request.getName(),
                    request.getEmail(),
                    request.getPhone(),
                    request.getAddress());
            return ResponseEntity.ok(MemberDetailResponseDto.from(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<MemberDetailResponseDto> resetPassword(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @RequestBody ResetPasswordRequestDto request
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        if (request == null || request.getNewPassword() == null) return ResponseEntity.badRequest().build();
        try {
            Member updated = adminMemberUseCase.resetPassword(id, request.getNewPassword(), request.getSendNotification());
            return ResponseEntity.ok(MemberDetailResponseDto.from(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<MemberDetailResponseDto> updateStatus(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @RequestBody UpdateMemberStatusRequestDto request
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        if (request == null || request.getStatus() == null) return ResponseEntity.badRequest().build();
        try {
            Member updated = adminMemberUseCase.updateMemberStatus(id, request.getStatus());
            return ResponseEntity.ok(MemberDetailResponseDto.from(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/unlock")
    public ResponseEntity<MemberDetailResponseDto> unlock(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        try {
            Member updated = adminMemberUseCase.unlockMember(id);
            return ResponseEntity.ok(MemberDetailResponseDto.from(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<MemberDetailResponseDto> updateRole(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @RequestBody UpdateMemberRoleRequestDto request
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        if (request == null || request.getRole() == null || request.getRole().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Member updated = adminMemberUseCase.updateMemberRole(id, request.getRole().trim());
            return ResponseEntity.ok(MemberDetailResponseDto.from(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        try {
            adminMemberUseCase.deleteMember(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private boolean isAdmin(String authorization) {
        Claims claims = jwtService.parseToken(authorization);
        if (claims == null) return false;
        String role = String.valueOf(claims.get("role"));
        return "ADMIN".equals(role) || "SUPER_ADMIN".equals(role)
                || "CONTENT_ADMIN".equals(role) || "SUPPORT_ADMIN".equals(role);
    }
}
