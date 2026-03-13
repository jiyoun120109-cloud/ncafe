package com.new_cafe.app.backend.notification.application.service;

import com.new_cafe.app.backend.notification.adapter.out.jpa.NotificationEntity;
import com.new_cafe.app.backend.notification.adapter.out.jpa.NotificationJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    private final NotificationJpaRepository notificationJpaRepository;

    public NotificationService(NotificationJpaRepository notificationJpaRepository) {
        this.notificationJpaRepository = notificationJpaRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationEntity> findByUserId(Long userId) {
        return notificationJpaRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public long countUnread(Long userId) {
        return notificationJpaRepository.countByUserIdAndReadAtIsNull(userId);
    }

    @Transactional
    public void markRead(Long userId, Long notificationId) {
        notificationJpaRepository.findById(notificationId).ifPresent(n -> {
            if (userId.equals(n.getUserId())) {
                n.setReadAt(LocalDateTime.now());
                notificationJpaRepository.save(n);
            }
        });
    }
}
