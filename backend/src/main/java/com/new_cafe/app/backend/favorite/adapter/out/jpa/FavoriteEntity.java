package com.new_cafe.app.backend.favorite.adapter.out.jpa;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "favorites", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "menu_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "menu_id", nullable = false)
    private Long menuId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
