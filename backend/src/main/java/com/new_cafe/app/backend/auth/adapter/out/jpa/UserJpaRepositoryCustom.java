package com.new_cafe.app.backend.auth.adapter.out.jpa;

import java.time.LocalDate;
import java.util.Map;

/**
 * 회원 목록 필터와 동일한 조건으로 역할별 건수 집계.
 */
public interface UserJpaRepositoryCustom {

    /**
     * 검색/상태/역할/가입일 필터와 동일한 조건으로 역할(role)별 회원 수를 집계합니다.
     * @return role -> count
     */
    Map<String, Long> countByRoleWithFilter(String search, String status, String role, LocalDate fromDate, LocalDate toDate);
}
