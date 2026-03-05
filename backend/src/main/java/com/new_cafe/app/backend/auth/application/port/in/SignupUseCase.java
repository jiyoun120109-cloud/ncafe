package com.new_cafe.app.backend.auth.application.port.in;

/**
 * 회원가입 유스케이스 (Inbound Port)
 */
public interface SignupUseCase {

    SignupResult signup(SignupCommand command);

    record SignupCommand(String username, String password) {}

    record SignupResult(boolean success, String message) {
        public static SignupResult ok() {
            return new SignupResult(true, "회원가입이 완료되었습니다.");
        }

        public static SignupResult failure(String message) {
            return new SignupResult(false, message);
        }
    }
}
