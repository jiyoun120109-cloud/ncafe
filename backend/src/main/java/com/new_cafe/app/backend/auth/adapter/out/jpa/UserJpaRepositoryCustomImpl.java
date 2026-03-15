package com.new_cafe.app.backend.auth.adapter.out.jpa;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 역할별 회원 수 집계 (목록과 동일한 필터 적용).
 */
public class UserJpaRepositoryCustomImpl implements UserJpaRepositoryCustom {

    private final EntityManager entityManager;

    public UserJpaRepositoryCustomImpl(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Override
    public Map<String, Long> countByRoleWithFilter(String search, String status, String role, LocalDate fromDate, LocalDate toDate) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Object[]> q = cb.createQuery(Object[].class);
        Root<UserEntity> root = q.from(UserEntity.class);

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

        q.multiselect(root.get("role"), cb.count(root))
            .groupBy(root.get("role"));
        if (!predicates.isEmpty()) {
            q.where(cb.and(predicates.toArray(new Predicate[0])));
        }

        TypedQuery<Object[]> typedQuery = entityManager.createQuery(q);
        List<Object[]> rows = typedQuery.getResultList();
        return rows.stream()
            .collect(Collectors.toMap(row -> (String) row[0], row -> (Long) row[1]));
    }
}
