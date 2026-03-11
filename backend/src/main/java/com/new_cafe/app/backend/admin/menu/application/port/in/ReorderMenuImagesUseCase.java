package com.new_cafe.app.backend.admin.menu.application.port.in;

import com.new_cafe.app.backend.admin.menu.application.command.ReorderMenuImagesCommand;

/**
 * 메뉴 이미지 순서 변경 (대표 이미지 설정)
 */
public interface ReorderMenuImagesUseCase {
    void reorderMenuImages(ReorderMenuImagesCommand command);
}
