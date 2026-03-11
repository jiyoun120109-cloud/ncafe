package com.new_cafe.app.backend.menu.application.service;

import com.new_cafe.app.backend.menu.application.command.MenuListCommand;
import com.new_cafe.app.backend.menu.application.command.GetMenuCommand;
import com.new_cafe.app.backend.menu.application.command.GetMenuImageListCommand;
import com.new_cafe.app.backend.menu.application.result.MenuListResult;
import com.new_cafe.app.backend.menu.application.result.MenuListResult.MenuInfo;
import com.new_cafe.app.backend.menu.application.result.GetMenuResult;
import com.new_cafe.app.backend.menu.application.result.GetMenuImageListResult;
import com.new_cafe.app.backend.menu.application.result.GetMenuImageListResult.MenuImageInfo;
import com.new_cafe.app.backend.menu.application.port.in.UserMenuUseCase;
import com.new_cafe.app.backend.menu.application.port.out.MenuImageRepositoryPort;
import com.new_cafe.app.backend.menu.application.port.out.MenuRepositoryPort;
import com.new_cafe.app.backend.menu.model.Menu;
import com.new_cafe.app.backend.menu.model.MenuImage;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 메뉴 서비스
 * UserMenuUseCase (조회 전용) 구현
 */
@Service
public class MenuService implements UserMenuUseCase {

    private final MenuRepositoryPort menuRepositoryPort;
    private final MenuImageRepositoryPort menuImageRepositoryPort;

    public MenuService(MenuRepositoryPort menuRepositoryPort,
            MenuImageRepositoryPort menuImageRepositoryPort) {
        this.menuRepositoryPort = menuRepositoryPort;
        this.menuImageRepositoryPort = menuImageRepositoryPort;
    }

    /**
     * 메뉴 목록 조회
     */
    @Override
    public MenuListResult getMenus(MenuListCommand command) {
        List<Menu> menus = menuRepositoryPort.findAllByCategoryIdAndSearchQuery(
                command.getCategoryId(),
                command.getSearchQuery(),
                command.getSortBy());

        List<MenuInfo> menuInfos = menus.stream()
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
        Menu menu = menuRepositoryPort.findById(command.getId());

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
                .productInfoJson(menu.getProductInfoJson())
                .optionsJson(menu.getOptionsJson())
                .createdAt(menu.getCreatedAt())
                .updatedAt(menu.getUpdatedAt())
                .build();
    }

    /**
     * 메뉴 이미지 목록 조회
     */
    @Override
    public GetMenuImageListResult getMenuImageList(GetMenuImageListCommand command) {
        List<MenuImageInfo> images = getMenuImages(command.getMenuId());
        return GetMenuImageListResult.builder()
                .menuImages(images)
                .altText("")
                .build();
    }

    /**
     * 메뉴 엔터티를 MenuInfo로 변환
     */
    private MenuInfo convertToMenuInfo(Menu menu) {
        List<MenuImageInfo> images = getMenuImages(menu.getId());
        String mainImageSrc = images.isEmpty() ? null : images.get(0).getImageUrl();
        String categoryName = menu.getCategory() != null ? menu.getCategory().getName() : "";
        List<String> badgeTypes = new ArrayList<>();
        if (Boolean.TRUE.equals(menu.getIsPopular())) badgeTypes.add("popular");
        if (Boolean.TRUE.equals(menu.getIsNew())) badgeTypes.add("new");
        if (Boolean.TRUE.equals(menu.getIsRecommended())) badgeTypes.add("recommended");

        return MenuInfo.builder()
                .id(menu.getId())
                .korName(menu.getKorName())
                .engName(menu.getEngName())
                .description(menu.getDescription())
                .price(menu.getPrice())
                .categoryName(categoryName)
                .imageSrc(mainImageSrc)
                .isAvailable(menu.getIsAvailable())
                .badgeTypes(badgeTypes)
                .displayPriority(menu.getDisplayPriority())
                .likeCount(menu.getLikeCount() != null ? menu.getLikeCount() : 0)
                .viewCount(menu.getViewCount() != null ? menu.getViewCount() : 0)
                .createdAt(menu.getCreatedAt())
                .updatedAt(menu.getUpdatedAt())
                .build();
    }

    /**
     * 메뉴 이미지 목록 조회
     */
    private List<MenuImageInfo> getMenuImages(long menuId) {
        List<MenuImage> images = menuImageRepositoryPort.findAllByMenuId(menuId);

        return images.stream()
                .map(image -> MenuImageInfo.builder()
                        .id(image.getId())
                        .imageUrl(image.getImageSrc())
                        .menuId(image.getMenuId())
                        .sortOrder(image.getSortOrder())
                        .build())
                .collect(Collectors.toList());
    }
}
