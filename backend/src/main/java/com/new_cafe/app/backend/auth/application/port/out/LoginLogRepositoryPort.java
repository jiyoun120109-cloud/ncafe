package com.new_cafe.app.backend.auth.application.port.out;

import com.new_cafe.app.backend.auth.model.LoginLogRecord;

import java.util.List;

/**
 * 로그인 로그 저장/조회 포트
 */
public interface LoginLogRepositoryPort {

    void save(Long userId, String nickname, boolean success, String ipAddress, String userAgent);

    List<LoginLogRecord> findRecentByUserId(Long userId, int limit);
}
