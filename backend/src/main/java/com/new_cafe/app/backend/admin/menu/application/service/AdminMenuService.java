package com.new_cafe.app.backend.admin.menu.application.service;

import com.new_cafe.app.backend.admin.menu.application.port.in.*;
import com.new_cafe.app.backend.admin.menu.application.command.CreateMenuCommand;
import com.new_cafe.app.backend.admin.menu.application.command.UpdateMenuCommand;
import com.new_cafe.app.backend.admin.menu.application.command.DeleteMenuCommand;
import com.new_cafe.app.backend.admin.menu.application.command.MenuListCommand;
import com.new_cafe.app.backend.admin.menu.application.command.GetMenuCommand;
import com.new_cafe.app.backend.admin.menu.application.command.GetMenuImageListCommand;
import com.new_cafe.app.backend.admin.menu.application.result.MenuListResult;
import com.new_cafe.app.backend.admin.menu.application.result.GetMenuResult;
import com.new_cafe.app.backend.admin.menu.application.result.GetMenuImageListResult;
import com.new_cafe.app.backend.admin.menu.application.result.CreateMenuResult;
import com.new_cafe.app.backend.admin.menu.application.result.UpdateMenuResult;
import com.new_cafe.app.backend.admin.menu.application.port.out.AdminMenuImageRepositoryPort;
import com.new_cafe.app.backend.admin.menu.application.port.out.AdminMenuRepositoryPort;
import com.new_cafe.app.backend.admin.menu.model.AdminMenu;
import com.new_cafe.app.backend.admin.menu.model.AdminMenuImage;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 관리자용 메뉴 관리 서비스
 * AdminMenuUseCase의 실제 구현체
 */
@Service
public class AdminMenuService implements AdminMenuUseCase {

    private final AdminMenuRepositoryPort adminMenuRepositoryPort;
    private final AdminMenuImageRepositoryPort adminMenuImageRepositoryPort;

    public AdminMenuService(AdminMenuRepositoryPort adminMenuRepositoryPort,
                           AdminMenuImageRepositoryPort adminMenuImageRepositoryPort) {
        this.adminMenuRepositoryPort = adminMenuRepositoryPort;
        this.adminMenuImageRepositoryPort = adminMenuImageRepositoryPort;
    }

    /**
     * 메뉴 목록 조회
     */
    @Override
    public MenuListResult getMenus(MenuListCommand command) {
        List<AdminMenu> menus = adminMenuRepositoryPort.findAllByCategoryIdAndSearchQuery(
            command.getCategoryId(),
            command.getSearchQuery()
        );

        List<MenuListResult.MenuInfo> menuInfos = menus.stream()
            .map(this::convertToMenuInfo)
            .collect(Collectors.toList());

        return MenuListResult.builder()
            .menus(menuInfos)
            .total(menuInfos.size())
            .build();
    }

    /**
     * 단일 메뉴 상세 조회
     */
    @Override
    public GetMenuResult getMenu(GetMenuCommand command) {
        AdminMenu menu = adminMenuRepositoryPort.findById(command.getId());
        
        if (menu == null) {
            throw new IllegalArgumentException("Menu not found with id: " + command.getId());
        }
        
        String categoryName = menu.getCategory() != null ? menu.getCategory().getName() : "";
        
        return GetMenuResult.builder()
            .id(menu.getId())
            .korName(menu.getKorName())
            .engName(menu.getEngName())
            .description(menu.getDescription())
            .price(menu.getPrice())
            .categoryName(categoryName)
            .isAvailable(menu.getIsAvailable())
            .createdAt(menu.getCreatedAt())
            .updatedAt(menu.getUpdatedAt())
            .build();
    }

    /**
     * 메뉴 이미지 목록 조회
     */
    @Override
    public GetMenuImageListResult getMenuImageList(GetMenuImageListCommand command) {
        List<GetMenuImageListResult.MenuImageInfo> images = getMenuImages(command.getMenuId());
        return GetMenuImageListResult.builder()
            .menuImages(images)
            .altText("")
            .build();
    }

    /**
     * 메뉴 생성
     */
    @Override
    public CreateMenuResult createMenu(CreateMenuCommand command) {
        // 메뉴 생성 로직 구현
        // TODO: menuRepositoryPort.save() 호출하여 메뉴 저장
        throw new UnsupportedOperationException("Create menu not yet implemented");
    }

    /**
     * 메뉴 수정
     */
    @Override
    public UpdateMenuResult updateMenu(UpdateMenuCommand command) {
        // 메뉴 수정 로직 구현
        // TODO: 기존 메뉴 조회 후 업데이트
        throw new UnsupportedOperationException("Update menu not yet implemented");
    }

    /**
     * 메뉴 삭제
     */
    @Override
    public void deleteMenu(DeleteMenuCommand command) {
        // 메뉴 삭제 로직 구현
        // TODO: menuRepositoryPort.deleteById() 호출하여 메뉴 삭제
        throw new UnsupportedOperationException("Delete menu not yet implemented");
    }

    /**
     * 메뉴를 MenuInfo로 변환
     */
    private MenuListResult.MenuInfo convertToMenuInfo(AdminMenu menu) {
        List<GetMenuImageListResult.MenuImageInfo> images = getMenuImages(menu.getId());
        String mainImageSrc = images.isEmpty() ? null : images.get(0).getImageUrl();
        String categoryName = menu.getCategory() != null ? menu.getCategory().getName() : "";
        
        return MenuListResult.MenuInfo.builder()
            .id(menu.getId())
            .korName(menu.getKorName())
            .engName(menu.getEngName())
            .description(menu.getDescription())
            .price(menu.getPrice())
            .categoryName(categoryName)
            .imageSrc(mainImageSrc)
            .isAvailable(menu.getIsAvailable())
            .createdAt(menu.getCreatedAt())
            .updatedAt(menu.getUpdatedAt())
            .build();
    }

    /**
     * 메뉴 이미지 목록 조회
     */
    private List<GetMenuImageListResult.MenuImageInfo> getMenuImages(long menuId) {
        List<AdminMenuImage> images = adminMenuImageRepositoryPort.findAllByMenuId(menuId);
        
        return images.stream()
            .map(image -> GetMenuImageListResult.MenuImageInfo.builder()
                .id(image.getId())
                .imageUrl(image.getImageSrc())
                .menuId(image.getMenuId())
                .sortOrder(image.getSortOrder())
                .build())
            .collect(Collectors.toList());
    }
}
