package com.new_cafe.app.backend.auth.adapter.out.jpa;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface UserJpaRepository extends JpaRepository<UserEntity, Long>, JpaSpecificationExecutor<UserEntity> {

    Optional<UserEntity> findByNickname(String nickname);

    List<UserEntity> findByRole(String role);

    Page<UserEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<UserEntity> findByNicknameContainingIgnoreCaseOrderByCreatedAtDesc(String nickname, Pageable pageable);
}
