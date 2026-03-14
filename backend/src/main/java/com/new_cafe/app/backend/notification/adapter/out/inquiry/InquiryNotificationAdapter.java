package com.new_cafe.app.backend.notification.adapter.out.inquiry;

import com.new_cafe.app.backend.inquiry.application.port.out.CreateNotificationPort;
import com.new_cafe.app.backend.notification.adapter.out.jpa.NotificationEntity;
import com.new_cafe.app.backend.notification.adapter.out.jpa.NotificationJpaRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class InquiryNotificationAdapter implements CreateNotificationPort {

    private final NotificationJpaRepository notificationJpaRepository;

    public InquiryNotificationAdapter(NotificationJpaRepository notificationJpaRepository) {
        this.notificationJpaRepository = notificationJpaRepository;
    }

    @Override
    public void create(Long userId, String type, Long refId, String title, String message) {
        NotificationEntity n = NotificationEntity.builder()
                .userId(userId)
                .type(type)
                .refId(refId)
                .title(title)
                .message(message)
                .createdAt(LocalDateTime.now())
                .build();
        notificationJpaRepository.save(n);
    }
}
