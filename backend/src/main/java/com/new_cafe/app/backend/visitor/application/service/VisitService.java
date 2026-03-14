package com.new_cafe.app.backend.visitor.application.service;

import com.new_cafe.app.backend.visitor.application.port.in.RecordVisitUseCase;
import com.new_cafe.app.backend.visitor.application.port.out.VisitorLogRepositoryPort;
import com.new_cafe.app.backend.visitor.model.VisitorLog;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class VisitService implements RecordVisitUseCase {

    private final VisitorLogRepositoryPort visitorLogRepository;

    public VisitService(VisitorLogRepositoryPort visitorLogRepository) {
        this.visitorLogRepository = visitorLogRepository;
    }

    @Override
    @Transactional
    public void recordVisit() {
        visitorLogRepository.save(VisitorLog.builder()
                .visitedAt(LocalDateTime.now())
                .build());
    }
}
