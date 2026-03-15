package com.new_cafe.app.backend.admin.member.application.service;

import com.new_cafe.app.backend.admin.member.adapter.in.web.dto.*;
import com.new_cafe.app.backend.admin.member.application.port.in.AdminMemberUseCase;
import com.new_cafe.app.backend.auth.application.port.out.LoginLogRepositoryPort;
import com.new_cafe.app.backend.auth.application.port.out.MemberRepositoryPort;
import com.new_cafe.app.backend.auth.model.LoginLogRecord;
import com.new_cafe.app.backend.auth.model.Member;
import com.new_cafe.app.backend.inquiry.application.port.out.InquiryRepositoryPort;
import com.new_cafe.app.backend.inquiry.model.Inquiry;
import com.new_cafe.app.backend.order.application.port.out.OrderRepositoryPort;
import com.new_cafe.app.backend.order.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminMemberService implements AdminMemberUseCase {

    private static final int RECENT_ACTIVITY_LIMIT = 10;

    private final MemberRepositoryPort memberRepositoryPort;
    private final OrderRepositoryPort orderRepositoryPort;
    private final InquiryRepositoryPort inquiryRepositoryPort;
    private final LoginLogRepositoryPort loginLogRepositoryPort;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AdminMemberService(MemberRepositoryPort memberRepositoryPort,
                              OrderRepositoryPort orderRepositoryPort,
                              InquiryRepositoryPort inquiryRepositoryPort,
                              LoginLogRepositoryPort loginLogRepositoryPort) {
        this.memberRepositoryPort = memberRepositoryPort;
        this.orderRepositoryPort = orderRepositoryPort;
        this.inquiryRepositoryPort = inquiryRepositoryPort;
        this.loginLogRepositoryPort = loginLogRepositoryPort;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Member> getMemberList(int page, int size, String search, String status, LocalDate fromDate, LocalDate toDate) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return memberRepositoryPort.findMembers(
            search != null ? search.trim() : null,
            status != null && !status.trim().isEmpty() ? status.trim().toUpperCase() : null,
            fromDate,
            toDate,
            pageable
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Member> getMember(Long id) {
        return memberRepositoryPort.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<MemberDetailWithActivityResponseDto> getMemberDetailWithActivity(Long id) {
        Optional<Member> memberOpt = memberRepositoryPort.findById(id);
        if (memberOpt.isEmpty()) return Optional.empty();
        Member member = memberOpt.get();
        List<Order> orders = orderRepositoryPort.findByUserIdOrderByCreatedAtDesc(id);
        List<Inquiry> inquiries = inquiryRepositoryPort.findByUserIdOrderByCreatedAtDesc(id);
        List<LoginLogRecord> loginLogs = loginLogRepositoryPort.findRecentByUserId(id, RECENT_ACTIVITY_LIMIT);
        List<OrderSummaryDto> orderDtos = orders.stream().limit(RECENT_ACTIVITY_LIMIT)
            .map(o -> OrderSummaryDto.builder()
                .id(o.getId())
                .status(o.getStatus())
                .totalAmount(o.getTotalAmount())
                .createdAt(o.getCreatedAt())
                .build())
            .collect(Collectors.toList());
        List<InquirySummaryDto> inquiryDtos = inquiries.stream().limit(RECENT_ACTIVITY_LIMIT)
            .map(i -> InquirySummaryDto.builder()
                .id(i.getId())
                .title(i.getTitle())
                .createdAt(i.getCreatedAt())
                .build())
            .collect(Collectors.toList());
        List<LoginLogEntryDto> logDtos = loginLogs.stream()
            .map(l -> LoginLogEntryDto.builder()
                .success(l.getSuccess())
                .ipAddress(l.getIpAddress())
                .createdAt(l.getCreatedAt())
                .build())
            .collect(Collectors.toList());
        MemberDetailWithActivityResponseDto dto = MemberDetailWithActivityResponseDto.builder()
            .member(MemberDetailResponseDto.from(member))
            .recentOrders(orderDtos)
            .recentInquiries(inquiryDtos)
            .recentLoginLogs(logDtos)
            .build();
        return Optional.of(dto);
    }

    @Override
    @Transactional
    public Member updateMemberProfile(Long id, String displayNickname, String name, String email, String phone, String address) {
        Member member = memberRepositoryPort.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        if (displayNickname != null) member.setDisplayNickname(displayNickname.trim().isEmpty() ? null : displayNickname.trim());
        if (name != null) member.setName(name.trim().isEmpty() ? null : name.trim());
        if (email != null) member.setEmail(email.trim().isEmpty() ? null : email.trim());
        if (phone != null) member.setPhone(phone.trim().isEmpty() ? null : phone.trim());
        if (address != null) member.setAddress(address.trim().isEmpty() ? null : address.trim());
        return memberRepositoryPort.save(member);
    }

    @Override
    @Transactional
    public Member resetPassword(Long id, String newPassword) {
        Member member = memberRepositoryPort.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("비밀번호는 6자 이상이어야 합니다.");
        }
        member.setPassword(passwordEncoder.encode(newPassword));
        member.setPasswordChangedAt(java.time.LocalDateTime.now());
        return memberRepositoryPort.save(member);
    }

    @Override
    @Transactional
    public Member updateMemberStatus(Long id, String status) {
        Member member = memberRepositoryPort.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        String s = status != null ? status.trim().toUpperCase() : null;
        if (s == null || !List.of("ACTIVE", "INACTIVE", "SUSPENDED", "WITHDRAWN").contains(s)) {
            throw new IllegalArgumentException("유효한 상태가 아닙니다.");
        }
        member.setStatus(s);
        return memberRepositoryPort.save(member);
    }

    @Override
    @Transactional
    public Member unlockMember(Long id) {
        Member member = memberRepositoryPort.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        member.setLockedUntil(null);
        member.setLoginFailCount(0);
        return memberRepositoryPort.save(member);
    }

    @Override
    @Transactional
    public Member updateMemberRole(Long id, String role) {
        Member member = memberRepositoryPort.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        String r = role != null ? role.trim().toUpperCase() : null;
        if (r == null || !List.of("ADMIN", "USER", "SUPER_ADMIN", "CONTENT_ADMIN", "SUPPORT_ADMIN").contains(r)) {
            throw new IllegalArgumentException("유효한 역할이 아닙니다.");
        }
        member.setRole(r);
        return memberRepositoryPort.save(member);
    }

    @Override
    @Transactional
    public void deleteMember(Long id) {
        Member member = memberRepositoryPort.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        memberRepositoryPort.deleteById(id);
    }
}
