package com.new_cafe.app.backend.visitor.adapter.in.web;

import com.new_cafe.app.backend.visitor.adapter.out.jpa.VisitorLogEntity;
import com.new_cafe.app.backend.visitor.adapter.out.jpa.VisitorLogJpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api")
public class VisitController {

    private final VisitorLogJpaRepository visitorLogJpaRepository;

    public VisitController(VisitorLogJpaRepository visitorLogJpaRepository) {
        this.visitorLogJpaRepository = visitorLogJpaRepository;
    }

    @PostMapping("/visit")
    public ResponseEntity<Void> recordVisit() {
        visitorLogJpaRepository.save(
            VisitorLogEntity.builder()
                .visitedAt(LocalDateTime.now())
                .build()
        );
        return ResponseEntity.ok().build();
    }
}
