package com.new_cafe.app.backend.order.adapter.in.web;

import com.new_cafe.app.backend.coupon.adapter.out.jpa.CouponEntity;
import com.new_cafe.app.backend.coupon.adapter.out.jpa.CouponJpaRepository;
import com.new_cafe.app.backend.coupon.adapter.out.jpa.UserCouponEntity;
import com.new_cafe.app.backend.coupon.adapter.out.jpa.UserCouponJpaRepository;
import com.new_cafe.app.backend.menu.adapter.out.jpa.MenuEntity;
import com.new_cafe.app.backend.menu.adapter.out.jpa.MenuJpaRepository;
import com.new_cafe.app.backend.order.application.port.in.GetOrderUseCase;
import com.new_cafe.app.backend.order.application.port.out.OrderRepositoryPort;
import com.new_cafe.app.backend.order.model.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * 주문에 보유 쿠폰 적용. 결제 페이지에서 호출.
 */
@Service
public class ApplyCouponToOrderService {

    private final GetOrderUseCase getOrderUseCase;
    private final OrderRepositoryPort orderRepositoryPort;
    private final UserCouponJpaRepository userCouponJpaRepository;
    private final CouponJpaRepository couponJpaRepository;
    private final MenuJpaRepository menuJpaRepository;

    public ApplyCouponToOrderService(GetOrderUseCase getOrderUseCase,
                                     OrderRepositoryPort orderRepositoryPort,
                                     UserCouponJpaRepository userCouponJpaRepository,
                                     CouponJpaRepository couponJpaRepository,
                                     MenuJpaRepository menuJpaRepository) {
        this.getOrderUseCase = getOrderUseCase;
        this.orderRepositoryPort = orderRepositoryPort;
        this.userCouponJpaRepository = userCouponJpaRepository;
        this.couponJpaRepository = couponJpaRepository;
        this.menuJpaRepository = menuJpaRepository;
    }

    @Transactional
    public Order apply(Long orderId, Long userId, Long userCouponId) {
        Order order = getOrderUseCase.getById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));
        if (order.getUserId() == null || !order.getUserId().equals(userId)) {
            throw new IllegalArgumentException("본인 주문에만 쿠폰을 적용할 수 있습니다.");
        }
        UserCouponEntity uc = userCouponJpaRepository.findById(userCouponId)
                .orElseThrow(() -> new IllegalArgumentException("쿠폰을 찾을 수 없습니다."));
        if (!uc.getUserId().equals(userId)) {
            throw new IllegalArgumentException("본인 쿠폰만 사용할 수 있습니다.");
        }
        if (uc.getUsedAt() != null) {
            throw new IllegalArgumentException("이미 사용한 쿠폰입니다.");
        }
        CouponEntity coupon = couponJpaRepository.findById(uc.getCouponId())
                .orElseThrow(() -> new IllegalArgumentException("쿠폰 정보를 찾을 수 없습니다."));
        int discount = 0;
        if (coupon.getMenuId() != null) {
            Optional<MenuEntity> menuOpt = menuJpaRepository.findById(coupon.getMenuId());
            if (menuOpt.isPresent() && menuOpt.get().getPrice() != null) {
                int americanoPrice = menuOpt.get().getPrice();
                // 아메리카노 가격 이하는 무료, 이상은 아메리카노 가격만큼만 할인
                discount = Math.min(americanoPrice, order.getTotalAmount());
            }
        }
        int newTotal = order.getTotalAmount() - discount;
        order.setTotalAmount(newTotal);
        order.setTotalPrice(newTotal);
        order.setAppliedUserCouponId(userCouponId);
        return orderRepositoryPort.save(order);
    }
}
