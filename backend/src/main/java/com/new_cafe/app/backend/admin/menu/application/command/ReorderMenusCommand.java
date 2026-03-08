package com.new_cafe.app.backend.admin.menu.application.command;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 메뉴 정렬 순서 변경 커맨드
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReorderMenusCommand {
    private List<Long> orderedIds;
}
