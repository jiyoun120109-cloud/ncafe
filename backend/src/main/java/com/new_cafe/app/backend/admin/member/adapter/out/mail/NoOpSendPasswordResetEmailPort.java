package com.new_cafe.app.backend.admin.member.adapter.out.mail;

import com.new_cafe.app.backend.admin.member.application.port.out.SendPasswordResetEmailPort;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

/**
 * 메일 설정(JavaMailSender) 미적용 시 사용. 이메일 발송 없음.
 */
@Component
@ConditionalOnMissingBean(SendPasswordResetEmailAdapter.class)
public class NoOpSendPasswordResetEmailPort implements SendPasswordResetEmailPort {

    @Override
    public void send(String toEmail, String memberDisplayName, String newPlainPassword) {
        // no-op when mail is not configured
    }
}
