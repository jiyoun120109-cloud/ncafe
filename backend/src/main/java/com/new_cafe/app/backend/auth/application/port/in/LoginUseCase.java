package com.new_cafe.app.backend.auth.application.port.in;

/**
 * 로그인 유스케이스 (Inbound Port)
 * 
 * 애플리케이션 외부(Controller 등)에서 호출하는 인터페이스입니다.
 * 구현체는 application.service 패키지의 AuthService에서 담당합니다.
 */
public interface LoginUseCase {

    /**
     * 사용자 인증을 수행합니다.
     *
     * @param command 로그인 요청 정보 (username, password)
     * @return 로그인 결과 (인증된 회원 정보)
     */
    LoginResult login(LoginCommand command);

    /**
     * 로그인 요청 커맨드 (입력값)
     * ipAddress, userAgent는 로그 기록용(선택)
     */
    record LoginCommand(
        String username,
        String password,
        String ipAddress,
        String userAgent
    ) {}

    /**
     * 로그인 결과 (출력값)
     */
    record LoginResult(
        Long memberId,
        String username,
        String name,
        String role,
        boolean success,
        String message
    ) {
        public static LoginResult success(Long memberId, String username, String name, String role) {
            return new LoginResult(memberId, username, name, role, true, "로그인 성공");
        }

        public static LoginResult failure(String message) {
            return new LoginResult(null, null, null, null, false, message);
        }
    }
}
