package com.new_cafe.app.backend.visitor.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;

public interface VisitorLogJpaRepository extends JpaRepository<VisitorLogEntity, Long> {

    @Query("SELECT COUNT(v) FROM VisitorLogEntity v WHERE v.visitedAt >= :from AND v.visitedAt < :to")
    long countByVisitedAtBetween(LocalDateTime from, LocalDateTime to);
}
