package com.new_cafe.app.backend.auth.adapter.out.persistence;

import com.new_cafe.app.backend.auth.application.port.out.LoginLogRepositoryPort;
import com.new_cafe.app.backend.auth.model.LoginLogRecord;
import com.new_cafe.app.backend.auth.adapter.out.jpa.LoginLogEntity;
import com.new_cafe.app.backend.auth.adapter.out.jpa.LoginLogJpaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class LoginLogPersistenceAdapter implements LoginLogRepositoryPort {

    private final LoginLogJpaRepository loginLogJpaRepository;

    public LoginLogPersistenceAdapter(LoginLogJpaRepository loginLogJpaRepository) {
        this.loginLogJpaRepository = loginLogJpaRepository;
    }

    @Override
    public void save(Long userId, String nickname, boolean success, String ipAddress, String userAgent) {
        LoginLogEntity entity = LoginLogEntity.builder()
            .userId(userId)
            .nickname(nickname != null ? nickname : "")
            .success(success)
            .ipAddress(ipAddress != null && ipAddress.length() > 45 ? ipAddress.substring(0, 45) : ipAddress)
            .userAgent(userAgent != null && userAgent.length() > 500 ? userAgent.substring(0, 500) : userAgent)
            .createdAt(LocalDateTime.now())
            .build();
        loginLogJpaRepository.save(entity);
    }

    @Override
    public List<LoginLogRecord> findRecentByUserId(Long userId, int limit) {
        return loginLogJpaRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, limit))
            .stream()
            .map(e -> LoginLogRecord.builder()
                .id(e.getId())
                .userId(e.getUserId())
                .nickname(e.getNickname())
                .success(e.getSuccess())
                .ipAddress(e.getIpAddress())
                .userAgent(e.getUserAgent())
                .createdAt(e.getCreatedAt())
                .build())
            .collect(Collectors.toList());
    }
}
