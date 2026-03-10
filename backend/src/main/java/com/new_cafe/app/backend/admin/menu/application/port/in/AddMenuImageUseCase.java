package com.new_cafe.app.backend.admin.menu.application.port.in;

/**
 * 메뉴 이미지 추가 유스케이스
 */
public interface AddMenuImageUseCase {
    void addMenuImage(Long menuId, String imageSrc, int sortOrder);
}
