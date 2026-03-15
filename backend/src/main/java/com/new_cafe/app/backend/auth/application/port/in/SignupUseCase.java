package com.new_cafe.app.backend.auth.application.port.in;

/**
 * 회원가입 유스케이스 (Inbound Port)
 */
public interface SignupUseCase {

    SignupResult signup(SignupCommand command);

    /** 아이디 사용 가능 여부 (비어있거나 이미 사용 중이면 false) */
    boolean isUsernameAvailable(String username);

    record SignupCommand(
        String username,
        String password,
        String name,
        java.time.LocalDate birthDate,
        String phone,
        String address,
        String displayNickname,
        String email
    ) {}

    record SignupResult(boolean success, String message) {
        public static SignupResult ok() {
            return new SignupResult(true, "회원가입이 완료되었습니다.");
        }

        public static SignupResult failure(String message) {
            return new SignupResult(false, message);
        }
    }
}
