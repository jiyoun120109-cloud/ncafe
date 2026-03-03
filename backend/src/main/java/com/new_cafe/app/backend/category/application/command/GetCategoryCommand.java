package com.new_cafe.app.backend.category.application.command;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 카테고리 단일 조회 명령
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetCategoryCommand {
    private Long id;
}
