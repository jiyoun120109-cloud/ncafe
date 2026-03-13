package com.new_cafe.app.backend.admin.notice.adapter.in.web.dto.req;

import lombok.Data;

@Data
public class UpdateNoticeRequestDto {
    private String noticeType;
    private String title;
    private String content;
    private Boolean isPinned;
}
