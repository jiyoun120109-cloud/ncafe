package com.new_cafe.app.backend.notification.application.service;

import com.new_cafe.app.backend.notification.application.port.in.NotificationQueryUseCase;
import com.new_cafe.app.backend.notification.application.port.out.NotificationRepositoryPort;
import com.new_cafe.app.backend.notification.model.Notification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService implements NotificationQueryUseCase {

    private final NotificationRepositoryPort notificationRepository;

    public NotificationService(NotificationRepositoryPort notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> findByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndReadAtIsNull(userId);
    }

    @Override
    @Transactional
    public void markRead(Long userId, Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (userId.equals(n.getUserId())) {
                n.setReadAt(LocalDateTime.now());
                notificationRepository.save(n);
            }
        });
    }

    @Override
    @Transactional
    public void deleteByUser(Long userId, Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (userId.equals(n.getUserId())) {
                notificationRepository.deleteById(notificationId);
            }
        });
    }
}
