package com.new_cafe.app.backend.admin.member.adapter.in.web.dto;

import com.new_cafe.app.backend.auth.model.Member;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberListResponseDto {
    private Long id;
    private String username;
    private String name;
    private String email;
    private String role;
    private String status;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;

    public static MemberListResponseDto from(Member m) {
        return MemberListResponseDto.builder()
                .id(m.getId())
                .username(m.getUsername())
                .name(m.getName())
                .email(m.getEmail())
                .role(m.getRole())
                .status(m.getStatus() != null ? m.getStatus() : "ACTIVE")
                .lastLoginAt(m.getLastLoginAt())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
