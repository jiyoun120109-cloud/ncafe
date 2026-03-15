package com.new_cafe.app.backend.order.adapter.out.jpa;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderJpaRepository extends JpaRepository<OrderEntity, Long>, JpaSpecificationExecutor<OrderEntity> {
    List<OrderEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<OrderEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<OrderEntity> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    Page<OrderEntity> findByStatusAndCreatedAtBetweenOrderByCreatedAtDesc(
            String status, LocalDateTime from, LocalDateTime to, Pageable pageable);

    Page<OrderEntity> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime from, LocalDateTime to, Pageable pageable);

    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.status = :status")
    long countByStatus(String status);

    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.createdAt >= :from AND o.createdAt < :to")
    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.status = :status AND o.createdAt >= :from AND o.createdAt <= :to")
    long countByStatusAndCreatedAtBetween(@Param("status") String status, LocalDateTime from, LocalDateTime to);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM OrderEntity o WHERE o.createdAt >= :from AND o.createdAt < :to AND o.status != 'CANCELLED'")
    long sumTotalAmountByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM OrderEntity o WHERE o.status = :status AND o.createdAt >= :from AND o.createdAt < :to")
    long sumTotalAmountByStatusAndCreatedAtBetween(@Param("status") String status, LocalDateTime from, LocalDateTime to);
}
