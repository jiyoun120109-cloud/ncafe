package com.new_cafe.app.backend.admin.member.adapter.in.web;

import com.new_cafe.app.backend.admin.member.adapter.in.web.dto.MemberDetailResponseDto;
import com.new_cafe.app.backend.admin.member.adapter.in.web.dto.MemberListResponseDto;
import com.new_cafe.app.backend.admin.member.adapter.in.web.dto.MemberPageResponseDto;
import com.new_cafe.app.backend.admin.member.adapter.in.web.dto.UpdateMemberRoleRequestDto;
import com.new_cafe.app.backend.admin.member.application.port.in.AdminMemberUseCase;
import com.new_cafe.app.backend.auth.adapter.out.jwt.JwtService;
import com.new_cafe.app.backend.auth.model.Member;
import io.jsonwebtoken.Claims;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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

    @GetMapping
    public ResponseEntity<MemberPageResponseDto> list(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        Page<Member> result = adminMemberUseCase.getMemberList(page, size, search);
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
    public ResponseEntity<MemberDetailResponseDto> get(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id
    ) {
        if (!isAdmin(authorization)) return ResponseEntity.status(403).build();
        return adminMemberUseCase.getMember(id)
                .map(m -> ResponseEntity.ok(MemberDetailResponseDto.from(m)))
                .orElse(ResponseEntity.notFound().build());
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

    private boolean isAdmin(String authorization) {
        Claims claims = jwtService.parseToken(authorization);
        return claims != null && "ADMIN".equals(claims.get("role"));
    }
}
