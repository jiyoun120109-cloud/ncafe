package com.new_cafe.app.backend.auth.application.port.out;

import com.new_cafe.app.backend.auth.model.Member;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Optional;

/**
 * 회원 저장소 포트 (Outbound Port)
 * 
 * 애플리케이션 서비스가 데이터를 조회/저장할 때 사용하는 인터페이스입니다.
 * 실제 구현은 adapter.out 패키지의 Repository에서 담당합니다.
 * 
 * DB가 바뀌더라도(PostgreSQL → MySQL, JPA → MyBatis 등)
 * 이 인터페이스만 구현하면 되므로 도메인 로직에는 영향이 없습니다.
 */
public interface MemberRepositoryPort {

    /**
     * username으로 회원을 조회합니다.
     */
    Optional<Member> findByUsername(String username);

    /**
     * 회원 정보를 저장합니다.
     */
    Member save(Member member);

    /**
     * ID로 회원을 조회합니다.
     */
    Optional<Member> findById(Long id);

    /**
     * 회원 목록 조회 (페이징, 최신순)
     */
    Page<Member> findAll(Pageable pageable);

    /**
     * 닉네임(아이디) 검색 (페이징, 최신순)
     */
    Page<Member> findByNicknameContaining(String search, Pageable pageable);

    /**
     * 회원 목록 조회 (검색어: 닉네임/이름/이메일, 상태, 가입일 범위, 페이징)
     */
    Page<Member> findMembers(String search, String status, LocalDate fromDate, LocalDate toDate, Pageable pageable);
}
