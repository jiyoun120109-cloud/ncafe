package com.new_cafe.app.backend.favorite.application.service;

import com.new_cafe.app.backend.favorite.adapter.out.jpa.FavoriteEntity;
import com.new_cafe.app.backend.favorite.adapter.out.jpa.FavoriteJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FavoriteService {

    private final FavoriteJpaRepository favoriteJpaRepository;

    public FavoriteService(FavoriteJpaRepository favoriteJpaRepository) {
        this.favoriteJpaRepository = favoriteJpaRepository;
    }

    @Transactional(readOnly = true)
    public List<FavoriteEntity> findByUserId(Long userId) {
        return favoriteJpaRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public FavoriteEntity add(Long userId, Long menuId) {
        Optional<FavoriteEntity> existing = favoriteJpaRepository.findByUserIdAndMenuId(userId, menuId);
        if (existing.isPresent()) return existing.get();
        FavoriteEntity e = FavoriteEntity.builder()
                .userId(userId)
                .menuId(menuId)
                .createdAt(LocalDateTime.now())
                .build();
        return favoriteJpaRepository.save(e);
    }

    @Transactional
    public void remove(Long userId, Long menuId) {
        favoriteJpaRepository.findByUserIdAndMenuId(userId, menuId).ifPresent(favoriteJpaRepository::delete);
    }

    @Transactional(readOnly = true)
    public boolean exists(Long userId, Long menuId) {
        return favoriteJpaRepository.existsByUserIdAndMenuId(userId, menuId);
    }
}
