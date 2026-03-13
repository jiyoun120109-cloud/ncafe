package com.new_cafe.app.backend.admin.member.application.service;

import com.new_cafe.app.backend.admin.member.application.port.in.AdminMemberUseCase;
import com.new_cafe.app.backend.auth.application.port.out.MemberRepositoryPort;
import com.new_cafe.app.backend.auth.domain.model.Member;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AdminMemberService implements AdminMemberUseCase {

    private final MemberRepositoryPort memberRepositoryPort;

    public AdminMemberService(MemberRepositoryPort memberRepositoryPort) {
        this.memberRepositoryPort = memberRepositoryPort;
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Member> getMemberList(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (search != null && !search.trim().isEmpty()) {
            return memberRepositoryPort.findByNicknameContaining(search.trim(), pageable);
        }
        return memberRepositoryPort.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Member> getMember(Long id) {
        return memberRepositoryPort.findById(id);
    }

    @Override
    @Transactional
    public Member updateMemberRole(Long id, String role) {
        Member member = memberRepositoryPort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        if (role == null || (!"ADMIN".equalsIgnoreCase(role) && !"USER".equalsIgnoreCase(role))) {
            throw new IllegalArgumentException("역할은 ADMIN 또는 USER만 지정할 수 있습니다.");
        }
        member.setRole(role.toUpperCase());
        return memberRepositoryPort.save(member);
    }
}
