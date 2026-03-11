package com.new_cafe.app.backend.admin.menu.application.command;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 메뉴 이미지 순서 변경 (첫 번째 = 대표 이미지)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReorderMenuImagesCommand {
    private Long menuId;
    /** 새 순서대로 이미지 ID 목록 (첫 번째가 대표) */
    private List<Long> orderedImageIds;
}
