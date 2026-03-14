package com.new_cafe.app.backend.favorite.adapter.in.web;

import com.new_cafe.app.backend.favorite.application.command.AddFavoriteCommand;
import com.new_cafe.app.backend.favorite.application.command.GetFavoritesCommand;
import com.new_cafe.app.backend.favorite.application.command.RemoveFavoriteCommand;
import com.new_cafe.app.backend.favorite.application.port.in.FavoriteUseCase;
import com.new_cafe.app.backend.favorite.application.result.AddFavoriteResult;
import com.new_cafe.app.backend.favorite.application.result.GetFavoritesResult;
import com.new_cafe.app.backend.auth.adapter.out.jwt.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteUseCase favoriteUseCase;
    private final JwtService jwtService;

    public FavoriteController(FavoriteUseCase favoriteUseCase, JwtService jwtService) {
        this.favoriteUseCase = favoriteUseCase;
        this.jwtService = jwtService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        Long userId = getUserId(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        GetFavoritesResult result = favoriteUseCase.getFavorites(
                GetFavoritesCommand.builder().userId(userId).build());
        List<Map<String, Object>> list = result.getItems().stream()
                .map(this::toMap)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> add(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody Map<String, Long> body
    ) {
        Long userId = getUserId(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        Long menuId = body.get("menuId");
        if (menuId == null) return ResponseEntity.badRequest().build();
        AddFavoriteResult r = favoriteUseCase.add(
                AddFavoriteCommand.builder().userId(userId).menuId(menuId).build());
        return ResponseEntity.ok(toMap(r));
    }

    @DeleteMapping("/{menuId}")
    public ResponseEntity<Void> remove(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long menuId
    ) {
        Long userId = getUserId(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        favoriteUseCase.remove(RemoveFavoriteCommand.builder().userId(userId).menuId(menuId).build());
        return ResponseEntity.ok().build();
    }

    private Long getUserId(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return null;
        return jwtService.getUserIdFromClaims(jwtService.parseToken(authorization));
    }

    private Map<String, Object> toMap(GetFavoritesResult.FavoriteItem item) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", item.getId());
        m.put("menuId", item.getMenuId());
        m.put("createdAt", item.getCreatedAt());
        return m;
    }

    private Map<String, Object> toMap(AddFavoriteResult r) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", r.getId());
        m.put("menuId", r.getMenuId());
        m.put("createdAt", r.getCreatedAt());
        return m;
    }
}
