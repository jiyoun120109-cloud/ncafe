package com.new_cafe.app.backend.admin.notice.application.command;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetNoticeCommand {
    private Long id;
    private boolean incrementView;
}
