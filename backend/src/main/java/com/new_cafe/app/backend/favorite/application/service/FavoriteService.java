package com.new_cafe.app.backend.favorite.application.service;

import com.new_cafe.app.backend.favorite.application.command.AddFavoriteCommand;
import com.new_cafe.app.backend.favorite.application.command.GetFavoritesCommand;
import com.new_cafe.app.backend.favorite.application.command.RemoveFavoriteCommand;
import com.new_cafe.app.backend.favorite.application.port.in.FavoriteUseCase;
import com.new_cafe.app.backend.favorite.application.port.out.FavoriteRepositoryPort;
import com.new_cafe.app.backend.favorite.application.result.AddFavoriteResult;
import com.new_cafe.app.backend.favorite.application.result.GetFavoritesResult;
import com.new_cafe.app.backend.favorite.model.Favorite;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FavoriteService implements FavoriteUseCase {

    private final FavoriteRepositoryPort favoriteRepository;

    public FavoriteService(FavoriteRepositoryPort favoriteRepository) {
        this.favoriteRepository = favoriteRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public GetFavoritesResult getFavorites(GetFavoritesCommand command) {
        List<Favorite> list = favoriteRepository.findByUserIdOrderByCreatedAtDesc(command.getUserId());
        List<GetFavoritesResult.FavoriteItem> items = list.stream()
                .map(f -> GetFavoritesResult.FavoriteItem.builder()
                        .id(f.getId())
                        .menuId(f.getMenuId())
                        .createdAt(f.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        return GetFavoritesResult.builder().items(items).build();
    }

    @Override
    @Transactional
    public AddFavoriteResult add(AddFavoriteCommand command) {
        Optional<Favorite> existing = favoriteRepository.findByUserIdAndMenuId(command.getUserId(), command.getMenuId());
        if (existing.isPresent()) {
            Favorite f = existing.get();
            return AddFavoriteResult.builder()
                    .id(f.getId())
                    .menuId(f.getMenuId())
                    .createdAt(f.getCreatedAt())
                    .build();
        }
        Favorite toSave = Favorite.builder()
                .userId(command.getUserId())
                .menuId(command.getMenuId())
                .createdAt(java.time.LocalDateTime.now())
                .build();
        Favorite saved = favoriteRepository.save(toSave);
        return AddFavoriteResult.builder()
                .id(saved.getId())
                .menuId(saved.getMenuId())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public void remove(RemoveFavoriteCommand command) {
        favoriteRepository.findByUserIdAndMenuId(command.getUserId(), command.getMenuId())
                .ifPresent(favoriteRepository::delete);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean exists(Long userId, Long menuId) {
        return favoriteRepository.existsByUserIdAndMenuId(userId, menuId);
    }
}
