package com.new_cafe.app.backend.admin.settings.adapter.out.jpa;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "site_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteSettingEntity {
    @Id
    @Column(name = "key", length = 100)
    private String key;

    @Column(name = "value", columnDefinition = "TEXT")
    private String value;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
