package com.new_cafe.app.backend.admin.notice.adapter.in.web.dto.res;

import com.new_cafe.app.backend.admin.notice.application.result.NoticeDetailResult;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NoticeDetailResponseDto {
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

    public static NoticeDetailResponseDto from(NoticeDetailResult r) {
        return NoticeDetailResponseDto.builder()
                .id(r.getId())
                .noticeType(r.getNoticeType())
                .title(r.getTitle())
                .content(r.getContent())
                .authorId(r.getAuthorId())
                .viewCount(r.getViewCount())
                .isPinned(r.isPinned())
                .pinnedAt(r.getPinnedAt())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
