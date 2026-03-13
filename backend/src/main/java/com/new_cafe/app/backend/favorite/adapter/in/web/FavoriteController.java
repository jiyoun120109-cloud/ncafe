package com.new_cafe.app.backend.favorite.adapter.in.web;

import com.new_cafe.app.backend.favorite.application.service.FavoriteService;
import com.new_cafe.app.backend.favorite.adapter.out.jpa.FavoriteEntity;
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

    private final FavoriteService favoriteService;
    private final JwtService jwtService;

    public FavoriteController(FavoriteService favoriteService, JwtService jwtService) {
        this.favoriteService = favoriteService;
        this.jwtService = jwtService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        Long userId = getUserId(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        List<FavoriteEntity> list = favoriteService.findByUserId(userId);
        return ResponseEntity.ok(list.stream().map(this::toMap).collect(Collectors.toList()));
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
        FavoriteEntity e = favoriteService.add(userId, menuId);
        return ResponseEntity.ok(toMap(e));
    }

    @DeleteMapping("/{menuId}")
    public ResponseEntity<Void> remove(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long menuId
    ) {
        Long userId = getUserId(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        favoriteService.remove(userId, menuId);
        return ResponseEntity.ok().build();
    }

    private Long getUserId(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return null;
        Claims claims = jwtService.parseToken(authorization);
        return jwtService.getUserIdFromClaims(claims);
    }

    private Map<String, Object> toMap(FavoriteEntity e) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", e.getId());
        m.put("menuId", e.getMenuId());
        m.put("createdAt", e.getCreatedAt());
        return m;
    }
}
