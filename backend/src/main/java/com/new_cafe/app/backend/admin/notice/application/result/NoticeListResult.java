package com.new_cafe.app.backend.admin.notice.application.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeListResult {
    private List<NoticeItem> content;
    private int totalPages;
    private long totalElements;
    private int number;
    private int size;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NoticeItem {
        private Long id;
        private String noticeType;
        private String title;
        private String content;
        private Long authorId;
        private int viewCount;
        private boolean isPinned;
        private LocalDateTime pinnedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
