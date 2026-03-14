package com.new_cafe.app.backend.auth.adapter.out.jpa;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoginLogJpaRepository extends JpaRepository<LoginLogEntity, Long> {

    List<LoginLogEntity> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
