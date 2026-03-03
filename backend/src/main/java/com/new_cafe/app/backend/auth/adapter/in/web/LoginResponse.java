package com.new_cafe.app.backend.auth.adapter.in.web;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 로그인 HTTP 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private boolean success;
    private String message;
    private String accessToken;  // JWT (BFF가 쿠키에 저장)
    private MemberInfo member;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberInfo {
        private Long id;
        private String username;
        private String name;
        private String role;
    }

    public static LoginResponse success(Long id, String username, String name, String role, String accessToken) {
        MemberInfo info = new MemberInfo(id, username, name, role);
        return new LoginResponse(true, "로그인 성공", accessToken, info);
    }

    public static LoginResponse failure(String message) {
        return new LoginResponse(false, message, null, null);
    }
}
