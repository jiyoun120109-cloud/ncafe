package com.new_cafe.app.backend.favorite.application.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddFavoriteResult {
    private Long id;
    private Long menuId;
    private LocalDateTime createdAt;
}
