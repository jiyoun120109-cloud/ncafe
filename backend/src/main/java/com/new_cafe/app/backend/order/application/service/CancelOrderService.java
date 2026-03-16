package com.new_cafe.app.backend.order.application.service;

import com.new_cafe.app.backend.coupon.adapter.out.jpa.UserCouponJpaRepository;
import com.new_cafe.app.backend.coupon.adapter.out.jpa.UserStampEntity;
import com.new_cafe.app.backend.coupon.adapter.out.jpa.UserStampJpaRepository;
import com.new_cafe.app.backend.menu.application.port.out.MenuRepositoryPort;
import com.new_cafe.app.backend.menu.model.Menu;
import com.new_cafe.app.backend.order.application.port.in.CancelOrderUseCase;
import com.new_cafe.app.backend.order.application.port.in.GetOrderUseCase;
import com.new_cafe.app.backend.order.application.port.out.OrderRepositoryPort;
import com.new_cafe.app.backend.order.model.Order;
import com.new_cafe.app.backend.order.model.OrderItem;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

@Service
public class CancelOrderService implements CancelOrderUseCase {

    private static final Set<String> STAMP_CATEGORY_NAMES = Set.of("커피", "라떼", "스무디", "에이드", "티");

    private final GetOrderUseCase getOrderUseCase;
    private final OrderRepositoryPort orderRepositoryPort;
    private final MenuRepositoryPort menuRepositoryPort;
    private final UserStampJpaRepository userStampJpaRepository;
    private final UserCouponJpaRepository userCouponJpaRepository;

    public CancelOrderService(GetOrderUseCase getOrderUseCase, OrderRepositoryPort orderRepositoryPort,
                              MenuRepositoryPort menuRepositoryPort,
                              UserStampJpaRepository userStampJpaRepository,
                              UserCouponJpaRepository userCouponJpaRepository) {
        this.getOrderUseCase = getOrderUseCase;
        this.orderRepositoryPort = orderRepositoryPort;
        this.menuRepositoryPort = menuRepositoryPort;
        this.userStampJpaRepository = userStampJpaRepository;
        this.userCouponJpaRepository = userCouponJpaRepository;
    }

    @Override
    @Transactional
    public Order cancel(Long orderId, Long userId) {
        Order order = getOrderUseCase.getById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));
        if (order.getUserId() == null || !order.getUserId().equals(userId)) {
            throw new IllegalArgumentException("본인의 주문만 취소할 수 있습니다.");
        }
        if ("CANCELLED".equals(order.getStatus())) {
            throw new IllegalArgumentException("이미 취소된 주문입니다.");
        }
        if ("PAID".equals(order.getStatus())) {
            rollbackStampAndCoupon(order);
        }
        order.setStatus("CANCELLED");
        return orderRepositoryPort.save(order);
    }

    private void rollbackStampAndCoupon(Order order) {
        Long userId = order.getUserId();
        if (userId == null) return;

        int stampsToRefund = 0;
        for (OrderItem item : order.getItems()) {
            Menu menu = menuRepositoryPort.findById(item.getMenuId());
            if (menu != null && menu.getCategory() != null
                    && STAMP_CATEGORY_NAMES.contains(menu.getCategory().getName())) {
                stampsToRefund += (item.getQuantity() != null ? item.getQuantity() : 1);
            }
        }
        if (stampsToRefund > 0) {
            Optional<UserStampEntity> stampOpt = userStampJpaRepository.findByUserId(userId);
            stampOpt.ifPresent(stamp -> {
                int current = stamp.getStampCount() != null ? stamp.getStampCount() : 0;
                stamp.setStampCount(Math.max(0, current - stampsToRefund));
                userStampJpaRepository.save(stamp);
            });
        }

        if (order.getAppliedUserCouponId() != null) {
            userCouponJpaRepository.findById(order.getAppliedUserCouponId()).ifPresent(uc -> {
                uc.setUsedAt(null);
                userCouponJpaRepository.save(uc);
            });
        }
    }
}
