package com.new_cafe.app.backend.admin.member.application.port.in;

import com.new_cafe.app.backend.admin.member.adapter.in.web.dto.MemberDetailWithActivityResponseDto;
import com.new_cafe.app.backend.auth.model.Member;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.Optional;

/**
 * 관리자 회원 관리 유스케이스
 */
public interface AdminMemberUseCase {

    /**
     * 회원 목록 조회 (페이징, 검색, 상태/가입일 필터)
     */
    Page<Member> getMemberList(int page, int size, String search, String status, LocalDate fromDate, LocalDate toDate);

    /**
     * 회원 상세 조회
     */
    Optional<Member> getMember(Long id);

    /**
     * 회원 상세 + 최근 활동(주문, 문의, 로그인 로그) 조회
     */
    Optional<MemberDetailWithActivityResponseDto> getMemberDetailWithActivity(Long id);

    /**
     * 회원 프로필 수정 (이메일, 연락처)
     */
    Member updateMemberProfile(Long id, String email, String phone);

    /**
     * 비밀번호 초기화 (관리자 설정)
     */
    Member resetPassword(Long id, String newPassword);

    /**
     * 계정 상태 변경 (ACTIVE, INACTIVE, SUSPENDED, WITHDRAWN)
     */
    Member updateMemberStatus(Long id, String status);

    /**
     * 계정 잠금 해제
     */
    Member unlockMember(Long id);

    /**
     * 회원 역할(권한) 변경
     */
    Member updateMemberRole(Long id, String role);
}
