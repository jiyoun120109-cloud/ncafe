package com.new_cafe.app.backend.auth.adapter.out.jpa;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserJpaRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByNickname(String nickname);

    Page<UserEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<UserEntity> findByNicknameContainingIgnoreCaseOrderByCreatedAtDesc(String nickname, Pageable pageable);
}
