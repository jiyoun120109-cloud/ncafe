package com.new_cafe.app.backend.payment.application.service;

import com.new_cafe.app.backend.coupon.adapter.out.jpa.CouponEntity;
import com.new_cafe.app.backend.coupon.adapter.out.jpa.CouponJpaRepository;
import com.new_cafe.app.backend.coupon.adapter.out.jpa.UserCouponEntity;
import com.new_cafe.app.backend.coupon.adapter.out.jpa.UserCouponJpaRepository;
import com.new_cafe.app.backend.coupon.adapter.out.jpa.UserStampEntity;
import com.new_cafe.app.backend.coupon.adapter.out.jpa.UserStampJpaRepository;
import com.new_cafe.app.backend.menu.adapter.out.jpa.MenuEntity;
import com.new_cafe.app.backend.menu.adapter.out.jpa.MenuJpaRepository;
import com.new_cafe.app.backend.order.application.port.in.GetOrderUseCase;
import com.new_cafe.app.backend.order.application.port.out.OrderRepositoryPort;
import com.new_cafe.app.backend.order.model.Order;
import com.new_cafe.app.backend.payment.application.port.in.ProcessPaymentUseCase;
import com.new_cafe.app.backend.payment.application.port.out.PaymentRepositoryPort;
import com.new_cafe.app.backend.payment.adapter.out.tosspayments.TossPaymentsClient;
import com.new_cafe.app.backend.payment.model.Payment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * 결제 서비스. 토스페이먼츠 연동.
 * 결제 완료 시 회원이면 커피·음료(라떼/스무디/에이드/티) 개수당 스탬프 1개씩 적립, 10개 모이면 아메리카노 무료 쿠폰 발급.
 */
@Service
public class PaymentService implements ProcessPaymentUseCase {

    /** 스탬프 적립 대상 카테고리 (커피 + 음료) */
    private static final Set<String> STAMP_CATEGORY_NAMES = Set.of("커피", "라떼", "스무디", "에이드", "티");

    private final PaymentRepositoryPort paymentRepository;
    private final GetOrderUseCase getOrderUseCase;
    private final OrderRepositoryPort orderRepositoryPort;
    private final MenuJpaRepository menuJpaRepository;
    private final UserStampJpaRepository userStampJpaRepository;
    private final UserCouponJpaRepository userCouponJpaRepository;
    private final CouponJpaRepository couponJpaRepository;
    private final TossPaymentsClient tossPaymentsClient;

    @Value("${kakao.pay.redirect-url:}")
    private String kakaoPayRedirectUrl;

    public PaymentService(PaymentRepositoryPort paymentRepository, GetOrderUseCase getOrderUseCase,
                          OrderRepositoryPort orderRepositoryPort,
                          MenuJpaRepository menuJpaRepository,
                          UserStampJpaRepository userStampJpaRepository,
                          UserCouponJpaRepository userCouponJpaRepository,
                          CouponJpaRepository couponJpaRepository,
                          TossPaymentsClient tossPaymentsClient) {
        this.paymentRepository = paymentRepository;
        this.getOrderUseCase = getOrderUseCase;
        this.orderRepositoryPort = orderRepositoryPort;
        this.menuJpaRepository = menuJpaRepository;
        this.userStampJpaRepository = userStampJpaRepository;
        this.userCouponJpaRepository = userCouponJpaRepository;
        this.couponJpaRepository = couponJpaRepository;
        this.tossPaymentsClient = tossPaymentsClient;
    }

    @Transactional
    public Map<String, Object> ready(Long orderId, String method) {
        Optional<Order> orderOpt = getOrderUseCase.getById(orderId);
        if (orderOpt.isEmpty()) {
            throw new IllegalArgumentException("주문을 찾을 수 없습니다.");
        }
        Order order = orderOpt.get();
        int amount = order.getTotalAmount() != null ? order.getTotalAmount() : 0;
        Payment payment = paymentRepository.save(Payment.builder()
                .orderId(orderId)
                .method(method != null ? method : "TOSS")
                .status("PENDING")
                .amount(amount)
                .createdAt(LocalDateTime.now())
                .build());
        order.setPaymentId(payment.getId());
        orderRepositoryPort.save(order);
        Map<String, Object> result = new HashMap<>();
        result.put("paymentId", payment.getId());
        result.put("orderId", orderId);
        result.put("amount", amount);
        result.put("redirectUrl", (kakaoPayRedirectUrl != null && !kakaoPayRedirectUrl.isEmpty())
                ? kakaoPayRedirectUrl
                : "/order/complete?orderId=" + orderId);
        return result;
    }

    @Transactional
    public void complete(Long orderId, String pgTid) {
        var existingPayment = paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId);
        boolean alreadyDone = existingPayment.map(p -> "DONE".equals(p.getStatus())).orElse(false);
        if (!alreadyDone && tossPaymentsClient.isConfigured()) {
            if (pgTid == null || pgTid.isBlank()) {
                throw new IllegalArgumentException("결제 키가 없습니다. 토스페이먼츠 결제 후 다시 시도해 주세요.");
            }
            tossPaymentsClient.verifyAndConfirm(pgTid, orderId, getOrderUseCase);
        }
        paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId).ifPresent(p -> {
            p.setStatus("DONE");
            if (pgTid != null && !pgTid.isBlank()) p.setPgTid(pgTid);
            p.setPaidAt(LocalDateTime.now());
            paymentRepository.save(p);
        });
        getOrderUseCase.getById(orderId).ifPresent(order -> {
            order.setStatus("PAID");
            orderRepositoryPort.save(order);
        });
        Optional<Order> orderOpt = getOrderUseCase.getById(orderId);
        if (orderOpt.isEmpty() || orderOpt.get().getUserId() == null) return;
        Order order = orderOpt.get();
        Long userId = order.getUserId();
        if (order.getAppliedUserCouponId() != null) {
            userCouponJpaRepository.findById(order.getAppliedUserCouponId()).ifPresent(uc -> {
                uc.setUsedAt(LocalDateTime.now());
                userCouponJpaRepository.save(uc);
            });
        }
        int stampsToAdd = 0;
        for (var item : order.getItems()) {
            Optional<MenuEntity> menuOpt = menuJpaRepository.findById(item.getMenuId());
            if (menuOpt.isEmpty() || menuOpt.get().getCategory() == null) continue;
            String categoryName = menuOpt.get().getCategory().getName();
            if (categoryName != null && STAMP_CATEGORY_NAMES.contains(categoryName)) {
                stampsToAdd += (item.getQuantity() != null ? item.getQuantity() : 1);
            }
        }
        if (stampsToAdd <= 0) return;

        LocalDateTime now = LocalDateTime.now();
        UserStampEntity stamp = userStampJpaRepository.findByUserId(userId).orElse(null);
        if (stamp == null) {
            stamp = UserStampEntity.builder().userId(userId).stampCount(stampsToAdd).createdAt(now).updatedAt(now).build();
        } else {
            stamp.setStampCount(stamp.getStampCount() + stampsToAdd);
            stamp.setUpdatedAt(now);
        }
        userStampJpaRepository.save(stamp);
        List<CouponEntity> stampRewards = couponJpaRepository.findAll().stream()
                .filter(c -> "STAMP_REWARD".equals(c.getCouponType()) && c.getRequiredStamps() != null).toList();
        for (CouponEntity coupon : stampRewards) {
            if (stamp.getStampCount() >= coupon.getRequiredStamps()) {
                UserCouponEntity uc = UserCouponEntity.builder()
                        .userId(userId).couponId(coupon.getId()).issuedAt(now).build();
                userCouponJpaRepository.save(uc);
                stamp.setStampCount(stamp.getStampCount() - coupon.getRequiredStamps());
                stamp.setUpdatedAt(now);
                userStampJpaRepository.save(stamp);
            }
        }
    }
}
