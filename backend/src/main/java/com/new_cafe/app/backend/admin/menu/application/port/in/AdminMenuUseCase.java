package com.new_cafe.app.backend.admin.menu.application.port.in;

/**
 * 관리자용 메뉴 관리 유스케이스
 * 조회, 생성, 수정, 삭제 권한을 모두 가지고 있습니다.
 * (단일책임원칙: 각 기능은 개별 인터페이스로 분리)
 */
public interface AdminMenuUseCase extends ViewAdminMenuListUseCase, CreateAdminMenuUseCase, UpdateAdminMenuUseCase, DeleteAdminMenuUseCase, ReorderAdminMenuUseCase {
}
