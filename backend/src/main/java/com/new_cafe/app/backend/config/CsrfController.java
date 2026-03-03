package com.new_cafe.app.backend.config;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.Map;

/**
 * BFF가 CSRF 토큰을 얻기 위한 엔드포인트.
 * Node fetch는 Set-Cookie를 읽을 수 없으므로 본문으로 토큰을 반환.
 */
@RestController
@RequestMapping("/api")
public class CsrfController {

    @GetMapping("/csrf")
    public Map<String, String> csrf(HttpServletRequest request) {
        CsrfToken token = (CsrfToken) request.getAttribute("_csrf");
        if (token == null) {
            token = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        }
        if (token == null) {
            return Collections.singletonMap("token", "");
        }
        return Collections.singletonMap("token", token.getToken());
    }
}
