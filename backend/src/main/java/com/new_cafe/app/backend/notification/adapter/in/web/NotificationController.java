package com.new_cafe.app.backend.notification.adapter.in.web;

import com.new_cafe.app.backend.notification.application.service.NotificationService;
import com.new_cafe.app.backend.notification.adapter.out.jpa.NotificationEntity;
import io.jsonwebtoken.Claims;
import com.new_cafe.app.backend.auth.adapter.out.jwt.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtService jwtService;

    public NotificationController(NotificationService notificationService, JwtService jwtService) {
        this.notificationService = notificationService;
        this.jwtService = jwtService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        Long userId = getUserId(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        List<NotificationEntity> list = notificationService.findByUserId(userId);
        return ResponseEntity.ok(list.stream().map(this::toMap).collect(Collectors.toList()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        Long userId = getUserId(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        long count = notificationService.countUnread(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id
    ) {
        Long userId = getUserId(authorization);
        if (userId == null) return ResponseEntity.status(401).build();
        notificationService.markRead(userId, id);
        return ResponseEntity.ok().build();
    }

    private Long getUserId(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return null;
        Claims claims = jwtService.parseToken(authorization);
        return claims == null ? null : Long.parseLong(claims.getSubject());
    }

    private Map<String, Object> toMap(NotificationEntity n) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", n.getId());
        m.put("type", n.getType());
        m.put("refId", n.getRefId());
        m.put("title", n.getTitle());
        m.put("message", n.getMessage());
        m.put("readAt", n.getReadAt());
        m.put("createdAt", n.getCreatedAt());
        return m;
    }
}
