package com.new_cafe.app.backend.visitor.adapter.out.jpa;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "visitor_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitorLogEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "visited_at", nullable = false)
    private LocalDateTime visitedAt;
}
