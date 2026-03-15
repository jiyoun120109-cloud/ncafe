package com.new_cafe.app.backend.favorite.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteJpaRepository extends JpaRepository<FavoriteEntity, Long> {
    List<FavoriteEntity> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<FavoriteEntity> findByUserIdAndMenuId(Long userId, Long menuId);
    boolean existsByUserIdAndMenuId(Long userId, Long menuId);
    long countByMenuId(Long menuId);
}
