package com.new_cafe.app.backend.notification.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationJpaRepository extends JpaRepository<NotificationEntity, Long> {
    List<NotificationEntity> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndReadAtIsNull(Long userId);
}
