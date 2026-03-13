package com.new_cafe.app.backend.auth.adapter.in.web;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 아이디 중복 확인 API 응답
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckUsernameResponse {
    /** true면 사용 가능, false면 이미 사용 중 */
    private boolean available;
}
