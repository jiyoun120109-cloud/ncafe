package com.new_cafe.app.backend.visitor.adapter.out.persistence;

import com.new_cafe.app.backend.visitor.application.port.out.VisitorLogRepositoryPort;
import com.new_cafe.app.backend.visitor.adapter.out.jpa.VisitorLogEntity;
import com.new_cafe.app.backend.visitor.adapter.out.jpa.VisitorLogJpaRepository;
import com.new_cafe.app.backend.visitor.model.VisitorLog;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class VisitorLogPersistenceAdapter implements VisitorLogRepositoryPort {

    private final VisitorLogJpaRepository visitorLogJpaRepository;

    public VisitorLogPersistenceAdapter(VisitorLogJpaRepository visitorLogJpaRepository) {
        this.visitorLogJpaRepository = visitorLogJpaRepository;
    }

    @Override
    public VisitorLog save(VisitorLog log) {
        VisitorLogEntity entity = toEntity(log);
        VisitorLogEntity saved = visitorLogJpaRepository.save(entity);
        return toModel(saved);
    }

    @Override
    public long countByVisitedAtBetween(LocalDateTime from, LocalDateTime to) {
        return visitorLogJpaRepository.countByVisitedAtBetween(from, to);
    }

    private VisitorLog toModel(VisitorLogEntity e) {
        return VisitorLog.builder()
                .id(e.getId())
                .visitedAt(e.getVisitedAt())
                .build();
    }

    private VisitorLogEntity toEntity(VisitorLog m) {
        return VisitorLogEntity.builder()
                .id(m.getId())
                .visitedAt(m.getVisitedAt())
                .build();
    }
}
