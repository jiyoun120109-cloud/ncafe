package com.new_cafe.app.backend.auth.adapter.out.persistence;

import com.new_cafe.app.backend.auth.application.port.out.GetMemberIdsByRolePort;
import com.new_cafe.app.backend.auth.application.port.out.MemberRepositoryPort;
import com.new_cafe.app.backend.auth.model.Member;
import com.new_cafe.app.backend.auth.adapter.out.jpa.UserEntity;
import com.new_cafe.app.backend.auth.adapter.out.jpa.UserJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 회원 저장소 어댑터 (Outbound Persistence Adapter)
 * MemberRepositoryPort 구현 — JPA(users 테이블) 사용.
 */
@Repository
public class MemberPersistenceAdapter implements MemberRepositoryPort, GetMemberIdsByRolePort {

    private final UserJpaRepository userJpaRepository;

    public MemberPersistenceAdapter(UserJpaRepository userJpaRepository) {
        this.userJpaRepository = userJpaRepository;
    }

    @Override
    public Optional<Member> findByUsername(String username) {
        return userJpaRepository.findByNickname(username)
            .map(this::toDomain);
    }

    @Override
    public Member save(Member member) {
        UserEntity entity = toEntity(member);
        if (entity.getId() == null) {
            entity.setCreatedAt(LocalDateTime.now());
            entity.setUpdatedAt(LocalDateTime.now());
        }
        UserEntity saved = userJpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Member> findById(Long id) {
        return userJpaRepository.findById(id)
            .map(this::toDomain);
    }

    @Override
    public Page<Member> findAll(Pageable pageable) {
        var page = userJpaRepository.findAllByOrderByCreatedAtDesc(pageable);
        return new PageImpl<>(
            page.getContent().stream().map(this::toDomain).collect(Collectors.toList()),
            page.getPageable(),
            page.getTotalElements()
        );
    }

    @Override
    public Page<Member> findByNicknameContaining(String search, Pageable pageable) {
        var page = userJpaRepository.findByNicknameContainingIgnoreCaseOrderByCreatedAtDesc(
            search != null ? search.trim() : "",
            pageable
        );
        return new PageImpl<>(
            page.getContent().stream().map(this::toDomain).collect(Collectors.toList()),
            page.getPageable(),
            page.getTotalElements()
        );
    }

    @Override
    public List<Long> findUserIdsByRole(String role) {
        return userJpaRepository.findByRole(role).stream()
            .map(UserEntity::getId)
            .collect(Collectors.toList());
    }

    private Member toDomain(UserEntity e) {
        return Member.builder()
            .id(e.getId())
            .username(e.getNickname())
            .password(e.getPassword())
            .name(e.getName())
            .email(e.getEmail())
            .birthDate(e.getBirthDate())
            .phone(e.getPhone())
            .displayNickname(e.getDisplayNickname() != null ? e.getDisplayNickname() : e.getNickname())
            .profileImageUrl(e.getProfileImageUrl())
            .role(e.getRole())
            .createdAt(e.getCreatedAt())
            .updatedAt(e.getUpdatedAt())
            .build();
    }

    private UserEntity toEntity(Member m) {
        return UserEntity.builder()
            .id(m.getId())
            .nickname(m.getUsername())
            .password(m.getPassword())
            .name(m.getName())
            .birthDate(m.getBirthDate())
            .phone(m.getPhone())
            .displayNickname(m.getDisplayNickname())
            .profileImageUrl(m.getProfileImageUrl())
            .email(m.getEmail())
            .role(m.getRole() != null ? m.getRole() : "USER")
            .createdAt(m.getCreatedAt())
            .updatedAt(m.getUpdatedAt())
            .build();
    }
}
