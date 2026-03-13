package com.new_cafe.app.backend.admin.member.application.port.in;

import com.new_cafe.app.backend.auth.domain.model.Member;
import org.springframework.data.domain.Page;

import java.util.Optional;

/**
 * 관리자 회원 관리 유스케이스
 */
public interface AdminMemberUseCase {

    /**
     * 회원 목록 조회 (페이징, 검색)
     */
    Page<Member> getMemberList(int page, int size, String search);

    /**
     * 회원 상세 조회
     */
    Optional<Member> getMember(Long id);

    /**
     * 회원 역할(권한) 변경
     */
    Member updateMemberRole(Long id, String role);
}
