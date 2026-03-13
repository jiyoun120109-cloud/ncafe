package com.new_cafe.app.backend.admin.notice.adapter.in.web.dto.res;

import com.new_cafe.app.backend.admin.notice.application.result.NoticeListResult;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class NoticeListResponseDto {
    private List<NoticeItemDto> content;
    private int totalPages;
    private long totalElements;
    private int number;
    private int size;

    @Data
    @Builder
    public static class NoticeItemDto {
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

    public static NoticeListResponseDto from(NoticeListResult result) {
        List<NoticeItemDto> items = result.getContent().stream()
                .map(item -> NoticeItemDto.builder()
                        .id(item.getId())
                        .noticeType(item.getNoticeType())
                        .title(item.getTitle())
                        .content(item.getContent())
                        .authorId(item.getAuthorId())
                        .viewCount(item.getViewCount())
                        .isPinned(item.isPinned())
                        .pinnedAt(item.getPinnedAt())
                        .createdAt(item.getCreatedAt())
                        .updatedAt(item.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
        return NoticeListResponseDto.builder()
                .content(items)
                .totalPages(result.getTotalPages())
                .totalElements(result.getTotalElements())
                .number(result.getNumber())
                .size(result.getSize())
                .build();
    }
}
