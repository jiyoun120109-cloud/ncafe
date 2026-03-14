package com.new_cafe.app.backend.visitor.adapter.in.web;

import com.new_cafe.app.backend.visitor.application.port.in.RecordVisitUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class VisitController {

    private final RecordVisitUseCase recordVisitUseCase;

    public VisitController(RecordVisitUseCase recordVisitUseCase) {
        this.recordVisitUseCase = recordVisitUseCase;
    }

    @PostMapping("/visit")
    public ResponseEntity<Void> recordVisit() {
        recordVisitUseCase.recordVisit();
        return ResponseEntity.ok().build();
    }
}
