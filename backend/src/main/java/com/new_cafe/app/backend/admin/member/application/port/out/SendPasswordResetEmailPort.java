package com.new_cafe.app.backend.admin.member.application.port.out;

/**
 * 비밀번호 초기화 시 회원 이메일로 새 비밀번호를 발송하는 포트.
 */
public interface SendPasswordResetEmailPort {

    /**
     * @param toEmail 수신 이메일 (null/blank면 발송하지 않음)
     * @param memberDisplayName 수신자 표시 이름 (이메일 본문용)
     * @param newPlainPassword 발송할 새 비밀번호 (평문)
     */
    void send(String toEmail, String memberDisplayName, String newPlainPassword);
}
