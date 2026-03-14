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
    private String role;
    private LocalDateTime createdAt;

    public static MemberListResponseDto from(Member m) {
        return MemberListResponseDto.builder()
                .id(m.getId())
                .username(m.getUsername())
                .name(m.getName())
                .role(m.getRole())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
