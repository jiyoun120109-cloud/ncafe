package com.new_cafe.app.backend.auth.adapter.out.persistence;

import com.new_cafe.app.backend.auth.domain.model.Member;
import com.new_cafe.app.backend.auth.application.port.out.MemberRepositoryPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 회원 저장소 어댑터 (Outbound Persistence Adapter)
 * 
 * MemberRepositoryPort 인터페이스를 구현하여
 * 실제 PostgreSQL 데이터베이스에 접근합니다.
 * 
 * 나중에 JPA, MyBatis 등으로 교체하더라도
 * 이 클래스만 새로 구현하면 되며, 도메인/애플리케이션 로직은 변경 불필요합니다.
 */
@Repository
public class MemberJdbcRepository implements MemberRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    public MemberJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // users 테이블: id(uuid), nickname, password, role, created_at, updated_at
    private final RowMapper<Member> memberRowMapper = (rs, rowNum) ->
        Member.builder()
            .id(rs.getLong("row_num"))
            .username(rs.getString("nickname"))
            .password(rs.getString("password"))
            .name(rs.getString("nickname"))
            .email(null)
            .role(rs.getString("role"))
            .createdAt(rs.getTimestamp("created_at") != null
                ? rs.getTimestamp("created_at").toLocalDateTime() : null)
            .updatedAt(rs.getTimestamp("updated_at") != null
                ? rs.getTimestamp("updated_at").toLocalDateTime() : null)
            .build();

    @Override
    public Optional<Member> findByUsername(String username) {
        String sql = "SELECT ROW_NUMBER() OVER () AS row_num, nickname, password, role, created_at, updated_at "
                   + "FROM users WHERE nickname = ?";
        List<Member> results = jdbcTemplate.query(sql, memberRowMapper, username);
        return results.stream().findFirst();
    }

    @Override
    public Member save(Member member) {
        String sql = "INSERT INTO users (nickname, password, role, created_at, updated_at) "
                   + "VALUES (?, ?, ?, NOW(), NOW())";
        jdbcTemplate.update(sql,
            member.getUsername(),
            member.getPassword(),
            member.getRole()
        );
        return member;
    }

    @Override
    public Optional<Member> findById(Long id) {
        String sql = "SELECT ROW_NUMBER() OVER () AS row_num, nickname, password, role, created_at, updated_at "
                   + "FROM users LIMIT 1 OFFSET ?";
        List<Member> results = jdbcTemplate.query(sql, memberRowMapper, id - 1);
        return results.stream().findFirst();
    }
}
