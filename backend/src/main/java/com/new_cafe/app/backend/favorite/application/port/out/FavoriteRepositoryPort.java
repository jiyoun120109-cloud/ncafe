package com.new_cafe.app.backend.favorite.application.port.out;

import com.new_cafe.app.backend.favorite.model.Favorite;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepositoryPort {

    List<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Favorite> findByUserIdAndMenuId(Long userId, Long menuId);

    Favorite save(Favorite favorite);

    void delete(Favorite favorite);

    boolean existsByUserIdAndMenuId(Long userId, Long menuId);
}
