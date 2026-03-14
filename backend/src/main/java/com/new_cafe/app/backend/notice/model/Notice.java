package com.new_cafe.app.backend.notice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notice {
    private Long id;
    private String title;
    private String content;
    private Long authorId;
    private String noticeType;
    private Integer viewCount;
    private Boolean isPinned;
    private LocalDateTime pinnedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
