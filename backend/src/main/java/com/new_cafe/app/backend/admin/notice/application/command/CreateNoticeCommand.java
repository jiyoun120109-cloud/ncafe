package com.new_cafe.app.backend.admin.notice.application.command;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateNoticeCommand {
    private String noticeType;
    private String title;
    private String content;
    private Long authorId;
    private Boolean isPinned;
}
