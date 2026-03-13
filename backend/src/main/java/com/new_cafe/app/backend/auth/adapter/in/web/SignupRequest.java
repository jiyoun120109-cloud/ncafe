package com.new_cafe.app.backend.auth.adapter.in.web;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 회원가입 HTTP 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {
    private String username;
    private String password;
    private String name;
    private LocalDate birthDate;
    private String phone;
    private String displayNickname;
    private String email;
}
