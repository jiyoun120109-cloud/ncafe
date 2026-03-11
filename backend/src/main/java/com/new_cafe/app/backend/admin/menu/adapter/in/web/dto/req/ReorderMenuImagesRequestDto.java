package com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.req;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 메뉴 이미지 순서 변경 요청 (첫 번째 = 대표 이미지)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReorderMenuImagesRequestDto {
    /** 새 순서대로 이미지 ID 목록 */
    private List<Long> orderedImageIds;
}
