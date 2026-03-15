package com.new_cafe.app.backend.user.adapter.in.web;

import com.new_cafe.app.backend.auth.application.port.out.MemberRepositoryPort;
import com.new_cafe.app.backend.auth.model.Member;
import com.new_cafe.app.backend.auth.adapter.out.jwt.JwtService;
import com.new_cafe.app.backend.coupon.adapter.out.jpa.CouponEntity;
import com.new_cafe.app.backend.coupon.adapter.out.jpa.CouponJpaRepository;
import com.new_cafe.app.backend.coupon.adapter.out.jpa.UserCouponEntity;
import com.new_cafe.app.backend.coupon.adapter.out.jpa.UserCouponJpaRepository;
import com.new_cafe.app.backend.coupon.adapter.out.jpa.UserStampEntity;
import com.new_cafe.app.backend.coupon.adapter.out.jpa.UserStampJpaRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 사용자 페이지: 프로필, 주문내역, 쿠폰/스탬프.
 * 주문내역은 /api/orders/my 사용.
 */
@RestController
@RequestMapping("/api/user")
public class UserProfileController {

    private final JwtService jwtService;
    private final MemberRepositoryPort memberRepositoryPort;
    private final UserStampJpaRepository userStampJpaRepository;
    private final UserCouponJpaRepository userCouponJpaRepository;
    private final CouponJpaRepository couponJpaRepository;

    @Value("${app.upload.dir:./upload}")
    private String uploadDir;

    public UserProfileController(JwtService jwtService,
                                MemberRepositoryPort memberRepositoryPort,
                                UserStampJpaRepository userStampJpaRepository,
                                UserCouponJpaRepository userCouponJpaRepository,
                                CouponJpaRepository couponJpaRepository) {
        this.jwtService = jwtService;
        this.memberRepositoryPort = memberRepositoryPort;
        this.userStampJpaRepository = userStampJpaRepository;
        this.userCouponJpaRepository = userCouponJpaRepository;
        this.couponJpaRepository = couponJpaRepository;
    }

    /** 회원 프로필 조회 (회원가입 정보) */
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> profile(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        Long userId = getUserId(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        Optional<Member> opt = memberRepositoryPort.findById(userId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Member m = opt.get();
        Map<String, Object> body = new HashMap<>();
        body.put("username", m.getUsername());
        body.put("name", m.getName());
        body.put("email", m.getEmail());
        body.put("birthDate", m.getBirthDate() != null ? m.getBirthDate().toString() : null);
        body.put("phone", m.getPhone());
        body.put("address", m.getAddress());
        body.put("displayNickname", m.getDisplayNickname());
        body.put("profileImageUrl", m.getProfileImageUrl());
        body.put("role", m.getRole());
        return ResponseEntity.ok(body);
    }

    /** 프로필 이미지 업로드 */
    @PostMapping("/profile/avatar")
    public ResponseEntity<Map<String, Object>> uploadAvatar(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        Long userId = getUserId(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        if (file == null || file.isEmpty()) return ResponseEntity.badRequest().build();
        long maxSize = 3 * 1024 * 1024; // 3MB
        if (file.getSize() > maxSize) {
            return ResponseEntity.badRequest().body(Map.of("error", "파일 크기는 3MB 이하여야 합니다."));
        }
        String originalName = file.getOriginalFilename();
        String ext = (originalName != null && originalName.contains("."))
                ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase()
                : ".jpg";
        if (!ext.matches("\\.(jpe?g|png|gif|webp)")) {
            return ResponseEntity.badRequest().body(Map.of("error", "이미지 파일만 업로드 가능합니다 (jpg, png, gif, webp)."));
        }
        String safeExt = ext.replaceAll("[^a-zA-Z0-9.]", "");
        Path dir = Paths.get(uploadDir.replaceFirst("^file:", "").trim(), "avatars").toAbsolutePath().normalize();
        if (!Files.exists(dir)) Files.createDirectories(dir);
        String filename = userId + safeExt;
        Path target = dir.resolve(filename);
        file.transferTo(target);
        String relativePath = "avatars/" + filename;
        Optional<Member> opt = memberRepositoryPort.findById(userId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Member m = opt.get();
        m.setProfileImageUrl(relativePath);
        memberRepositoryPort.save(m);
        Map<String, Object> body = new HashMap<>();
        body.put("profileImageUrl", relativePath);
        return ResponseEntity.ok(body);
    }

    /** 회원 프로필 수정 (이름, 이메일, 생년월일, 전화, 닉네임만. 아이디/비밀번호 제외) */
    @PatchMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody Map<String, Object> request
    ) {
        Long userId = getUserId(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        Optional<Member> opt = memberRepositoryPort.findById(userId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Member m = opt.get();

        if (request.containsKey("name")) m.setName(request.get("name") != null ? request.get("name").toString().trim() : null);
        if (request.containsKey("email")) m.setEmail(request.get("email") != null ? request.get("email").toString().trim() : null);
        if (request.containsKey("birthDate")) {
            Object b = request.get("birthDate");
            if (b == null || b.toString().trim().isEmpty()) {
                m.setBirthDate(null);
            } else {
                try {
                    m.setBirthDate(LocalDate.parse(b.toString()));
                } catch (Exception ignored) {}
            }
        }
        if (request.containsKey("phone")) m.setPhone(request.get("phone") != null ? request.get("phone").toString().trim() : null);
        if (request.containsKey("address")) m.setAddress(request.get("address") != null ? request.get("address").toString().trim() : null);
        if (request.containsKey("displayNickname")) m.setDisplayNickname(request.get("displayNickname") != null ? request.get("displayNickname").toString().trim() : null);

        memberRepositoryPort.save(m);

        Map<String, Object> body = new HashMap<>();
        body.put("username", m.getUsername());
        body.put("name", m.getName());
        body.put("email", m.getEmail());
        body.put("birthDate", m.getBirthDate() != null ? m.getBirthDate().toString() : null);
        body.put("phone", m.getPhone());
        body.put("address", m.getAddress());
        body.put("displayNickname", m.getDisplayNickname());
        body.put("profileImageUrl", m.getProfileImageUrl());
        body.put("role", m.getRole());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/stamps")
    public ResponseEntity<Map<String, Object>> stamps(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        Long userId = getUserId(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        Optional<UserStampEntity> opt = userStampJpaRepository.findByUserId(userId);
        int count = opt.map(UserStampEntity::getStampCount).orElse(0);
        Map<String, Object> m = new HashMap<>();
        m.put("stampCount", count);
        m.put("requiredForReward", 10);
        return ResponseEntity.ok(m);
    }

    @GetMapping("/coupons")
    public ResponseEntity<List<Map<String, Object>>> coupons(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        Long userId = getUserId(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        List<UserCouponEntity> list = userCouponJpaRepository.findByUserIdOrderByIssuedAtDesc(userId);
        List<Map<String, Object>> body = list.stream().map(uc -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", uc.getId());
            m.put("couponId", uc.getCouponId());
            m.put("usedAt", uc.getUsedAt());
            m.put("issuedAt", uc.getIssuedAt());
            LocalDateTime validUntil = uc.getIssuedAt() != null ? uc.getIssuedAt().plusDays(30) : null;
            m.put("validUntil", validUntil != null ? validUntil.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null);
            couponJpaRepository.findById(uc.getCouponId()).ifPresent(c -> {
                m.put("couponName", c.getName());
                m.put("couponCode", c.getName());
                m.put("menuId", c.getMenuId());
            });
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(body);
    }

    /** 쿠폰 코드로 쿠폰 등록 (코드 = 쿠폰 name과 일치) */
    @PostMapping("/coupons/redeem")
    public ResponseEntity<Map<String, Object>> redeemCoupon(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody Map<String, String> body
    ) {
        Long userId = getUserId(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        String code = body != null ? body.get("code") : null;
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "쿠폰 코드를 입력해주세요."));
        }
        String trimmed = code.trim();
        Optional<CouponEntity> couponOpt = couponJpaRepository.findByName(trimmed);
        if (couponOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "유효하지 않은 쿠폰 코드예요."));
        }
        CouponEntity coupon = couponOpt.get();
        if (userCouponJpaRepository.findByUserIdAndCouponId(userId, coupon.getId()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "이미 등록된 쿠폰이에요."));
        }
        LocalDateTime now = LocalDateTime.now();
        UserCouponEntity uc = UserCouponEntity.builder()
                .userId(userId)
                .couponId(coupon.getId())
                .issuedAt(now)
                .build();
        userCouponJpaRepository.save(uc);
        return ResponseEntity.ok(Map.of("message", "쿠폰이 등록되었어요!"));
    }

    private Long getUserId(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return null;
        return jwtService.getUserIdFromClaims(jwtService.parseToken(authorization));
    }
}
