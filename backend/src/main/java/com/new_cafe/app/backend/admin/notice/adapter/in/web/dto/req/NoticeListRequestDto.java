package com.new_cafe.app.backend.admin.notice.adapter.in.web.dto.req;

import lombok.Data;

@Data
public class NoticeListRequestDto {
    private int page = 0;
    private int size = 10;
    private String search;
}
