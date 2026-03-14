package com.new_cafe.app.backend.notification.adapter.out.persistence;

import com.new_cafe.app.backend.notification.application.port.out.NotificationRepositoryPort;
import com.new_cafe.app.backend.notification.adapter.out.jpa.NotificationEntity;
import com.new_cafe.app.backend.notification.adapter.out.jpa.NotificationJpaRepository;
import com.new_cafe.app.backend.notification.model.Notification;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class NotificationPersistenceAdapter implements NotificationRepositoryPort {

    private final NotificationJpaRepository notificationJpaRepository;

    public NotificationPersistenceAdapter(NotificationJpaRepository notificationJpaRepository) {
        this.notificationJpaRepository = notificationJpaRepository;
    }

    @Override
    public List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId) {
        return notificationJpaRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    @Override
    public long countByUserIdAndReadAtIsNull(Long userId) {
        return notificationJpaRepository.countByUserIdAndReadAtIsNull(userId);
    }

    @Override
    public Optional<Notification> findById(Long id) {
        return notificationJpaRepository.findById(id).map(this::toModel);
    }

    @Override
    public Notification save(Notification notification) {
        NotificationEntity entity = toEntity(notification);
        NotificationEntity saved = notificationJpaRepository.save(entity);
        return toModel(saved);
    }

    @Override
    public void deleteById(Long id) {
        notificationJpaRepository.deleteById(id);
    }

    private Notification toModel(NotificationEntity e) {
        return Notification.builder()
                .id(e.getId())
                .userId(e.getUserId())
                .type(e.getType())
                .refId(e.getRefId())
                .title(e.getTitle())
                .message(e.getMessage())
                .readAt(e.getReadAt())
                .createdAt(e.getCreatedAt())
                .build();
    }

    private NotificationEntity toEntity(Notification m) {
        return NotificationEntity.builder()
                .id(m.getId())
                .userId(m.getUserId())
                .type(m.getType())
                .refId(m.getRefId())
                .title(m.getTitle())
                .message(m.getMessage())
                .readAt(m.getReadAt())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
