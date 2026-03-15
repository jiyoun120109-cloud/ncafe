package com.new_cafe.app.backend.auth.application.service;

import com.new_cafe.app.backend.auth.model.Member;
import com.new_cafe.app.backend.auth.application.port.in.LoginUseCase;
import com.new_cafe.app.backend.auth.application.port.in.SignupUseCase;
import com.new_cafe.app.backend.auth.application.port.out.LoginLogRepositoryPort;
import com.new_cafe.app.backend.auth.application.port.out.MemberRepositoryPort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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

    private static final int MAX_LOGIN_FAIL = 5;
    private static final int LOCK_MINUTES = 30;

    private final MemberRepositoryPort memberRepository;
    private final LoginLogRepositoryPort loginLogRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(MemberRepositoryPort memberRepository, LoginLogRepositoryPort loginLogRepository) {
        this.memberRepository = memberRepository;
        this.loginLogRepository = loginLogRepository;
    }

    @Override
    public LoginResult login(LoginCommand command) {
        Optional<Member> memberOpt = memberRepository.findByUsername(command.username());

        if (memberOpt.isEmpty()) {
            logLogin(null, command.username(), false, command.ipAddress(), command.userAgent());
            return LoginResult.failure("존재하지 않는 사용자입니다.");
        }

        Member member = memberOpt.get();
        String ip = command.ipAddress();
        String ua = command.userAgent();

        if (!"ACTIVE".equals(member.getStatus())) {
            logLogin(member.getId(), member.getUsername(), false, ip, ua);
            return LoginResult.failure("비활성화된 계정입니다. 관리자에게 문의하세요.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (member.getLockedUntil() != null && now.isBefore(member.getLockedUntil())) {
            logLogin(member.getId(), member.getUsername(), false, ip, ua);
            return LoginResult.failure("로그인 시도 횟수 초과로 계정이 잠겼습니다. 잠시 후 다시 시도하세요.");
        }

        String stored = member.getPassword();
        boolean passwordMatch = stored != null && stored.startsWith("$2")
            ? passwordEncoder.matches(command.password(), stored)
            : command.password().equals(stored);

        if (!passwordMatch) {
            int failCount = (member.getLoginFailCount() != null ? member.getLoginFailCount() : 0) + 1;
            member.setLoginFailCount(failCount);
            if (failCount >= MAX_LOGIN_FAIL) {
                member.setLockedUntil(now.plusMinutes(LOCK_MINUTES));
            }
            memberRepository.save(member);
            logLogin(member.getId(), member.getUsername(), false, ip, ua);
            return LoginResult.failure("비밀번호가 일치하지 않습니다.");
        }

        member.setLastLoginAt(now);
        member.setLoginFailCount(0);
        member.setLockedUntil(null);
        memberRepository.save(member);
        logLogin(member.getId(), member.getUsername(), true, ip, ua);

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

    private void logLogin(Long userId, String nickname, boolean success, String ipAddress, String userAgent) {
        try {
            loginLogRepository.save(userId, nickname != null ? nickname : "", success, ipAddress, userAgent);
        } catch (Exception ignored) { }
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
        String address = command.address() != null ? command.address().trim() : null;
        Member member = Member.builder()
            .username(username)
            .password(encodedPassword)
            .name(name != null && !name.isEmpty() ? name : username)
            .birthDate(command.birthDate())
            .phone(command.phone() != null ? command.phone().trim() : null)
            .address(address != null && !address.isEmpty() ? address : null)
            .displayNickname(displayNickname)
            .email(email != null && !email.isEmpty() ? email : null)
            .role("USER")
            .status("ACTIVE")
            .loginFailCount(0)
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
