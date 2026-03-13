package com.new_cafe.app.backend.admin.member.adapter.in.web.dto;

import com.new_cafe.app.backend.auth.domain.model.Member;
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
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MemberDetailResponseDto from(Member m) {
        return MemberDetailResponseDto.builder()
                .id(m.getId())
                .username(m.getUsername())
                .name(m.getName())
                .email(m.getEmail())
                .role(m.getRole())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
