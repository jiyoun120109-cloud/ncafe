package com.new_cafe.app.backend.auth.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 회원 도메인 모델
 * 헥사고날 아키텍처의 핵심 도메인 객체로,
 * 어떤 인프라(DB, 외부 API 등)에도 의존하지 않습니다.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {
    private Long id;
    private String username;
    private String password;
    private String name;
    private String email;
    private String role;       // ADMIN, USER 등
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
