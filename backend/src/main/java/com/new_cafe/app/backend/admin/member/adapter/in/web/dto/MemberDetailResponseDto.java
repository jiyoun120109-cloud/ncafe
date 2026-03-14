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
public class MemberDetailResponseDto {
    private Long id;
    private String username;
    private String name;
    private String email;
    private String phone;
    private String displayNickname;
    private String role;
    private String status;
    private LocalDateTime lastLoginAt;
    private LocalDateTime lockedUntil;
    private Integer loginFailCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MemberDetailResponseDto from(Member m) {
        return MemberDetailResponseDto.builder()
                .id(m.getId())
                .username(m.getUsername())
                .name(m.getName())
                .email(m.getEmail())
                .phone(m.getPhone())
                .displayNickname(m.getDisplayNickname())
                .role(m.getRole())
                .status(m.getStatus())
                .lastLoginAt(m.getLastLoginAt())
                .lockedUntil(m.getLockedUntil())
                .loginFailCount(m.getLoginFailCount())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
