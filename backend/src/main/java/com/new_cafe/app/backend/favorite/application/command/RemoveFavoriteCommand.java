package com.new_cafe.app.backend.favorite.application.command;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RemoveFavoriteCommand {
    private Long userId;
    private Long menuId;
}
