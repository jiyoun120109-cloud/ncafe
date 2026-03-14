package com.new_cafe.app.backend.auth.application.service;

import com.new_cafe.app.backend.auth.model.Member;
import com.new_cafe.app.backend.auth.application.port.in.LoginUseCase;
import com.new_cafe.app.backend.auth.application.port.in.SignupUseCase;
import com.new_cafe.app.backend.auth.application.port.out.MemberRepositoryPort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * 인증 애플리케이션 서비스 (Use Case 구현체)
 * 
 * 헥사고날 아키텍처에서 유스케이스 오케스트레이션을 담당합니다.
 * Inbound Port(LoginUseCase, SignupUseCase)를 구현하고,
 * Outbound Port(MemberRepositoryPort)를 통해 데이터에 접근합니다.
 */
@Service
public class AuthService implements LoginUseCase, SignupUseCase {

    private final MemberRepositoryPort memberRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(MemberRepositoryPort memberRepository) {
        this.memberRepository = memberRepository;
    }

    @Override
    public LoginResult login(LoginCommand command) {
        // 1. username으로 회원 조회
        Optional<Member> memberOpt = memberRepository.findByUsername(command.username());

        if (memberOpt.isEmpty()) {
            return LoginResult.failure("존재하지 않는 사용자입니다.");
        }

        Member member = memberOpt.get();

        // bcrypt 해시($2로 시작)면 matches(), 평문이면 직접 비교
        String stored = member.getPassword();
        boolean passwordMatch = stored.startsWith("$2")
            ? passwordEncoder.matches(command.password(), stored)
            : command.password().equals(stored);

        if (!passwordMatch) {
            return LoginResult.failure("비밀번호가 일치하지 않습니다.");
        }

        // 3. 인증 성공 (표시 이름: 닉네임 우선, 없으면 실명)
        String displayName = member.getDisplayNickname() != null && !member.getDisplayNickname().isEmpty()
            ? member.getDisplayNickname() : member.getName();
        if (displayName == null || displayName.isEmpty()) displayName = member.getUsername();
        return LoginResult.success(
            member.getId(),
            member.getUsername(),
            displayName,
            member.getRole()
        );
    }

    @Override
    public SignupResult signup(SignupCommand command) {
        String username = command.username() != null ? command.username().trim() : "";
        String password = command.password();

        if (username.isEmpty()) {
            return SignupResult.failure("아이디를 입력해주세요.");
        }
        if (password == null || password.length() < 6) {
            return SignupResult.failure("비밀번호는 6자 이상 입력해주세요.");
        }
        if (!password.matches(".*[0-9].*") || !password.matches(".*[a-zA-Z].*")) {
            return SignupResult.failure("비밀번호는 영문과 숫자를 조합해주세요.");
        }

        if (memberRepository.findByUsername(username).isPresent()) {
            return SignupResult.failure("이미 사용 중인 아이디입니다.");
        }

        String encodedPassword = passwordEncoder.encode(password);
        String name = command.name() != null ? command.name().trim() : null;
        String displayNickname = command.displayNickname() != null ? command.displayNickname().trim() : null;
        if (displayNickname == null || displayNickname.isEmpty()) {
            displayNickname = username;
        }
        String email = command.email() != null ? command.email().trim() : null;
        Member member = Member.builder()
            .username(username)
            .password(encodedPassword)
            .name(name != null && !name.isEmpty() ? name : username)
            .birthDate(command.birthDate())
            .phone(command.phone() != null ? command.phone().trim() : null)
            .displayNickname(displayNickname)
            .email(email != null && !email.isEmpty() ? email : null)
            .role("USER")
            .build();
        memberRepository.save(member);
        return SignupResult.ok();
    }

    @Override
    public boolean isUsernameAvailable(String username) {
        if (username == null || username.trim().isEmpty()) {
            return false;
        }
        return memberRepository.findByUsername(username.trim()).isEmpty();
    }
}
