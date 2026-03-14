package com.new_cafe.app.backend.auth.adapter.in.web;

import com.new_cafe.app.backend.auth.adapter.out.jwt.JwtService;
import com.new_cafe.app.backend.auth.application.port.in.LoginUseCase;
import com.new_cafe.app.backend.auth.application.port.in.LoginUseCase.LoginCommand;
import com.new_cafe.app.backend.auth.application.port.in.LoginUseCase.LoginResult;
import com.new_cafe.app.backend.auth.application.port.in.SignupUseCase;
import com.new_cafe.app.backend.auth.application.port.in.SignupUseCase.SignupCommand;
import com.new_cafe.app.backend.auth.application.port.in.SignupUseCase.SignupResult;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 인증 컨트롤러 (Inbound Web Adapter)
 * BFF 인증: 세션 없이 JWT 발급 → BFF가 JWT를 쿠키에 저장 후 API 호출 시 Bearer로 전달.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final LoginUseCase loginUseCase;
    private final SignupUseCase signupUseCase;
    private final JwtService jwtService;

    public AuthController(LoginUseCase loginUseCase, SignupUseCase signupUseCase, JwtService jwtService) {
        this.loginUseCase = loginUseCase;
        this.signupUseCase = signupUseCase;
        this.jwtService = jwtService;
    }

    /**
     * 로그인 — JWT 발급 (세션 미사용)
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginCommand command = new LoginCommand(
            request.getUsername(),
            request.getPassword()
        );

        LoginResult result = loginUseCase.login(command);

        if (!result.success()) {
            return ResponseEntity.status(401).body(
                LoginResponse.failure(result.message())
            );
        }

        String accessToken = jwtService.createToken(
            result.memberId(),
            result.username(),
            result.role()
        );

        return ResponseEntity.ok(
            LoginResponse.success(
                result.memberId(),
                result.username(),
                result.name(),
                result.role(),
                accessToken
            )
        );
    }

    /**
     * 회원가입 — USER 역할로 저장, 비밀번호 BCrypt 암호화
     * POST /api/auth/signup
     */
    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(@RequestBody SignupRequest request) {
        SignupResult result = signupUseCase.signup(
            new SignupCommand(
                request.getUsername(),
                request.getPassword(),
                request.getName(),
                request.getBirthDate(),
                request.getPhone(),
                request.getDisplayNickname(),
                request.getEmail()
            )
        );
        if (!result.success()) {
            return ResponseEntity.badRequest().body(
                new SignupResponse(false, result.message())
            );
        }
        return ResponseEntity.status(201).body(
            new SignupResponse(true, result.message())
        );
    }

    /**
     * 아이디(닉네임) 사용 가능 여부 확인
     * GET /api/auth/check-username?username=xxx
     */
    @GetMapping("/check-username")
    public ResponseEntity<CheckUsernameResponse> checkUsername(@RequestParam String username) {
        boolean available = signupUseCase.isUsernameAvailable(username != null ? username.trim() : "");
        return ResponseEntity.ok(new CheckUsernameResponse(available));
    }

    /**
     * 로그아웃 — 서버 상태 없음. BFF에서 쿠키 삭제.
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<LoginResponse> logout() {
        return ResponseEntity.ok(
            new LoginResponse(true, "로그아웃 성공", null, null)
        );
    }

    /**
     * 현재 로그인 사용자 — Authorization: Bearer JWT 로 검증
     * GET /api/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<LoginResponse> me(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        Claims claims = jwtService.parseToken(authorization);
        if (claims == null) {
            return ResponseEntity.status(401).body(
                LoginResponse.failure("로그인이 필요합니다.")
            );
        }

        Long memberId = jwtService.getUserIdFromClaims(claims);
        if (memberId == null) {
            return ResponseEntity.status(401).body(
                LoginResponse.failure("로그인이 필요합니다.")
            );
        }
        String username = claims.get("username", String.class);
        String role = claims.get("role", String.class);

        return ResponseEntity.ok(
            LoginResponse.success(memberId, username, null, role, null)
        );
    }
}
