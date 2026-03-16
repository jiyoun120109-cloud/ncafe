package com.new_cafe.app.backend.admin.notice.application.command;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeListCommand {
    private int page;
    private int size;
    private String search;
    private String noticeType;
    private LocalDate fromDate;
    private LocalDate toDate;
}
