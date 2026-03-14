package com.new_cafe.app.backend.notification.application.port.out;

import com.new_cafe.app.backend.notification.model.Notification;

import java.util.List;
import java.util.Optional;

public interface NotificationRepositoryPort {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserIdAndReadAtIsNull(Long userId);

    Optional<Notification> findById(Long id);

    Notification save(Notification notification);
}
