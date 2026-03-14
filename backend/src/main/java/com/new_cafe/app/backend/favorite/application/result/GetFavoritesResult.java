package com.new_cafe.app.backend.favorite.application.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetFavoritesResult {
    private List<FavoriteItem> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FavoriteItem {
        private Long id;
        private Long menuId;
        private LocalDateTime createdAt;
    }
}
