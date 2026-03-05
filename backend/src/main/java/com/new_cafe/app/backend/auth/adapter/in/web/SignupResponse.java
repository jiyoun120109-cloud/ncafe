package com.new_cafe.app.backend.auth.adapter.in.web;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 회원가입 HTTP 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupResponse {
    private boolean success;
    private String message;
}
