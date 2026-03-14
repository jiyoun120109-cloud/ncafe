package com.new_cafe.app.backend.favorite.application.port.in;

import com.new_cafe.app.backend.favorite.application.command.AddFavoriteCommand;
import com.new_cafe.app.backend.favorite.application.command.GetFavoritesCommand;
import com.new_cafe.app.backend.favorite.application.command.RemoveFavoriteCommand;
import com.new_cafe.app.backend.favorite.application.result.AddFavoriteResult;
import com.new_cafe.app.backend.favorite.application.result.GetFavoritesResult;

public interface FavoriteUseCase {

    GetFavoritesResult getFavorites(GetFavoritesCommand command);

    AddFavoriteResult add(AddFavoriteCommand command);

    void remove(RemoveFavoriteCommand command);

    boolean exists(Long userId, Long menuId);
}
