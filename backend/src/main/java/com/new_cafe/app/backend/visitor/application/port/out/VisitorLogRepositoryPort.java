package com.new_cafe.app.backend.visitor.application.port.out;

import com.new_cafe.app.backend.visitor.model.VisitorLog;

import java.time.LocalDateTime;

public interface VisitorLogRepositoryPort {

    VisitorLog save(VisitorLog log);

    long countByVisitedAtBetween(LocalDateTime from, LocalDateTime to);
}
