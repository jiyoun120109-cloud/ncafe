package com.new_cafe.app.backend.auth.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
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
    private String username;      // 로그인 아이디
    private String password;
    private String name;          // 실명
    private String email;
    private LocalDate birthDate;  // 생년월일
    private String phone;         // 핸드폰 번호
    private String displayNickname; // 서비스 표시 닉네임
    private String profileImageUrl; // 프로필 이미지 경로 (예: avatars/17.jpg)
    private String role;          // ADMIN, USER, SUPER_ADMIN, CONTENT_ADMIN, SUPPORT_ADMIN 등
    private String status;        // ACTIVE, INACTIVE, SUSPENDED, WITHDRAWN
    private LocalDateTime lastLoginAt;
    private LocalDateTime passwordChangedAt;
    private LocalDateTime lockedUntil;
    private Integer loginFailCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
