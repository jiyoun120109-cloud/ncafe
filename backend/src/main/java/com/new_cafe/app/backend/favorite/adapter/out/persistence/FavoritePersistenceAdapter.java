package com.new_cafe.app.backend.favorite.adapter.out.persistence;

import com.new_cafe.app.backend.favorite.application.port.out.FavoriteRepositoryPort;
import com.new_cafe.app.backend.favorite.adapter.out.jpa.FavoriteEntity;
import com.new_cafe.app.backend.favorite.adapter.out.jpa.FavoriteJpaRepository;
import com.new_cafe.app.backend.favorite.model.Favorite;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class FavoritePersistenceAdapter implements FavoriteRepositoryPort {

    private final FavoriteJpaRepository favoriteJpaRepository;

    public FavoritePersistenceAdapter(FavoriteJpaRepository favoriteJpaRepository) {
        this.favoriteJpaRepository = favoriteJpaRepository;
    }

    @Override
    public List<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId) {
        return favoriteJpaRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Favorite> findByUserIdAndMenuId(Long userId, Long menuId) {
        return favoriteJpaRepository.findByUserIdAndMenuId(userId, menuId).map(this::toModel);
    }

    @Override
    public Favorite save(Favorite favorite) {
        FavoriteEntity entity = toEntity(favorite);
        FavoriteEntity saved = favoriteJpaRepository.save(entity);
        return toModel(saved);
    }

    @Override
    public void delete(Favorite favorite) {
        FavoriteEntity entity = toEntity(favorite);
        favoriteJpaRepository.delete(entity);
    }

    @Override
    public boolean existsByUserIdAndMenuId(Long userId, Long menuId) {
        return favoriteJpaRepository.existsByUserIdAndMenuId(userId, menuId);
    }

    private Favorite toModel(FavoriteEntity e) {
        return Favorite.builder()
                .id(e.getId())
                .userId(e.getUserId())
                .menuId(e.getMenuId())
                .createdAt(e.getCreatedAt())
                .build();
    }

    private FavoriteEntity toEntity(Favorite m) {
        return FavoriteEntity.builder()
                .id(m.getId())
                .userId(m.getUserId())
                .menuId(m.getMenuId())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
