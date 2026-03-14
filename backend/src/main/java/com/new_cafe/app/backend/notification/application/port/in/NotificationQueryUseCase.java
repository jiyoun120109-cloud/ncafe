package com.new_cafe.app.backend.notification.application.port.in;

import com.new_cafe.app.backend.notification.model.Notification;

import java.util.List;

public interface NotificationQueryUseCase {

    List<Notification> findByUserId(Long userId);

    long countUnread(Long userId);

    void markRead(Long userId, Long notificationId);

    void deleteByUser(Long userId, Long notificationId);
}
