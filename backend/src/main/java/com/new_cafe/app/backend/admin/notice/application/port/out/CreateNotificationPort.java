package com.new_cafe.app.backend.admin.notice.application.port.out;

/**
 * 공지 등록 시 회원 알림 생성용 포트.
 * 구현은 notification 모듈의 adapter에서 제공.
 */
public interface CreateNotificationPort {

    void create(Long userId, String type, Long refId, String title, String message);
}
