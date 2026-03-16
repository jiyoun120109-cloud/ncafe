package com.new_cafe.app.backend.order.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderItemJpaRepository extends JpaRepository<OrderItemEntity, Long> {
    List<OrderItemEntity> findByOrderId(Long orderId);

    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItemEntity oi JOIN oi.order o WHERE oi.menuId = :menuId AND o.createdAt >= :since")
    long sumQuantityByMenuIdAndOrderCreatedAtAfter(@Param("menuId") Long menuId, @Param("since") LocalDateTime since);
}
