package com.new_cafe.app.backend.admin.member.adapter.out.mail;

import com.new_cafe.app.backend.admin.member.application.port.out.SendPasswordResetEmailPort;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnBean(JavaMailSender.class)
public class SendPasswordResetEmailAdapter implements SendPasswordResetEmailPort {

    private static final Logger log = LoggerFactory.getLogger(SendPasswordResetEmailAdapter.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public SendPasswordResetEmailAdapter(JavaMailSender mailSender,
                                         @Value("${app.mail.from:}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress != null ? fromAddress.trim() : "";
    }

    @Override
    public void send(String toEmail, String memberDisplayName, String newPlainPassword) {
        if (toEmail == null || toEmail.isBlank()) {
            return;
        }
        String from = fromAddress.isBlank() ? "noreply@localhost" : fromAddress;
        String name = memberDisplayName != null && !memberDisplayName.isBlank() ? memberDisplayName : "회원";
        String subject = "비밀번호가 초기화되었습니다";
        String body = String.format(
            "안녕하세요, %s님.\n\n관리자에 의해 비밀번호가 초기화되었습니다.\n새 비밀번호: %s\n\n로그인 후 필요 시 비밀번호를 변경해 주세요.",
            name, newPlainPassword
        );
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(from);
            helper.setTo(toEmail.trim());
            helper.setSubject(subject);
            helper.setText(body, false);
            mailSender.send(message);
            log.info("비밀번호 초기화 안내 이메일 발송 완료: {}", toEmail);
        } catch (MessagingException e) {
            log.warn("비밀번호 초기화 이메일 발송 실패 (수신: {}): {}", toEmail, e.getMessage());
        } catch (Exception e) {
            log.warn("비밀번호 초기화 이메일 발송 실패 (수신: {}, 메일 설정 확인): {}", toEmail, e.getMessage());
        }
    }
}
