package com.new_cafe.app.backend.auth.adapter.out.persistence;

import com.new_cafe.app.backend.auth.application.port.out.GetMemberIdsByRolePort;
import com.new_cafe.app.backend.auth.application.port.out.MemberRepositoryPort;
import com.new_cafe.app.backend.auth.model.Member;
import com.new_cafe.app.backend.auth.adapter.out.jpa.UserEntity;
import com.new_cafe.app.backend.auth.adapter.out.jpa.UserJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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
    public Page<Member> findMembers(String search, String status, String role, LocalDate fromDate, LocalDate toDate, Pageable pageable) {
        Specification<UserEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            String trimmed = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
            if (trimmed != null) {
                String pattern = "%" + trimmed + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("nickname")), pattern.toLowerCase()),
                    cb.like(cb.lower(root.get("name")), pattern.toLowerCase()),
                    cb.like(cb.lower(root.get("email")), pattern.toLowerCase())
                ));
            }
            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), status.trim().toUpperCase()));
            }
            if (role != null && !role.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("role"), role.trim().toUpperCase()));
            }
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate.atStartOfDay()));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), toDate.atTime(LocalTime.MAX)));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        var page = userJpaRepository.findAll(spec, pageable);
        return new PageImpl<>(
            page.getContent().stream().map(this::toDomain).collect(Collectors.toList()),
            page.getPageable(),
            page.getTotalElements()
        );
    }

    @Override
    public Map<String, Long> countByRoleWithFilter(String search, String status, String role, LocalDate fromDate, LocalDate toDate) {
        return userJpaRepository.countByRoleWithFilter(
            search != null ? search.trim() : null,
            status != null && !status.trim().isEmpty() ? status.trim().toUpperCase() : null,
            role != null && !role.trim().isEmpty() ? role.trim().toUpperCase() : null,
            fromDate,
            toDate
        );
    }

    @Override
    public List<Long> findUserIdsByRole(String role) {
        return userJpaRepository.findByRole(role).stream()
            .map(UserEntity::getId)
            .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        userJpaRepository.deleteById(id);
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
            .address(e.getAddress())
            .displayNickname(e.getDisplayNickname() != null ? e.getDisplayNickname() : e.getNickname())
            .profileImageUrl(e.getProfileImageUrl())
            .role(e.getRole())
            .status(e.getStatus() != null ? e.getStatus() : "ACTIVE")
            .lastLoginAt(e.getLastLoginAt())
            .passwordChangedAt(e.getPasswordChangedAt())
            .lockedUntil(e.getLockedUntil())
            .loginFailCount(e.getLoginFailCount() != null ? e.getLoginFailCount() : 0)
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
            .address(m.getAddress())
            .displayNickname(m.getDisplayNickname())
            .profileImageUrl(m.getProfileImageUrl())
            .email(m.getEmail())
            .role(m.getRole() != null ? m.getRole() : "USER")
            .status(m.getStatus() != null ? m.getStatus() : "ACTIVE")
            .lastLoginAt(m.getLastLoginAt())
            .passwordChangedAt(m.getPasswordChangedAt())
            .lockedUntil(m.getLockedUntil())
            .loginFailCount(m.getLoginFailCount() != null ? m.getLoginFailCount() : 0)
            .createdAt(m.getCreatedAt())
            .updatedAt(m.getUpdatedAt())
            .build();
    }
}
