package com.new_cafe.app.backend.admin.menu.application.service;

import com.new_cafe.app.backend.admin.menu.application.port.in.*;
import com.new_cafe.app.backend.admin.menu.application.command.CreateMenuCommand;
import com.new_cafe.app.backend.admin.menu.application.command.UpdateMenuCommand;
import com.new_cafe.app.backend.admin.menu.application.command.DeleteMenuCommand;
import com.new_cafe.app.backend.admin.menu.application.command.ReorderMenusCommand;
import com.new_cafe.app.backend.admin.menu.application.command.ReorderMenuImagesCommand;
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
import com.new_cafe.app.backend.favorite.adapter.out.jpa.FavoriteJpaRepository;
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
    private final FavoriteJpaRepository favoriteJpaRepository;

    public AdminMenuService(AdminMenuRepositoryPort adminMenuRepositoryPort,
                           AdminMenuImageRepositoryPort adminMenuImageRepositoryPort,
                           FavoriteJpaRepository favoriteJpaRepository) {
        this.adminMenuRepositoryPort = adminMenuRepositoryPort;
        this.adminMenuImageRepositoryPort = adminMenuImageRepositoryPort;
        this.favoriteJpaRepository = favoriteJpaRepository;
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
        
        Long categoryId = menu.getCategory() != null ? menu.getCategory().getId() : null;
        String categoryName = menu.getCategory() != null ? menu.getCategory().getName() : "";
        int likeCountAgg = (int) favoriteJpaRepository.countByMenuId(menu.getId());
        Integer viewCount = menu.getViewCount() != null ? menu.getViewCount() : 0;

        return GetMenuResult.builder()
            .id(menu.getId())
            .korName(menu.getKorName())
            .engName(menu.getEngName())
            .categoryId(categoryId)
            .description(menu.getDescription())
            .price(menu.getPrice())
            .categoryName(categoryName)
            .isAvailable(menu.getIsAvailable())
            .optionsJson(menu.getOptionsJson())
            .productInfoJson(menu.getProductInfoJson())
            .isPopular(menu.getIsPopular())
            .isNew(menu.getIsNew())
            .isRecommended(menu.getIsRecommended())
            .displayPriority(menu.getDisplayPriority())
            .likeCount(likeCountAgg)
            .viewCount(viewCount)
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
        int nextSort = adminMenuRepositoryPort.findAllByCategoryIdAndSearchQuery(null, null).stream()
            .mapToInt(m -> m.getSortOrder() != null ? m.getSortOrder() : 0)
            .max()
            .orElse(0) + 1;
        AdminMenu newMenu = AdminMenu.builder()
            .id(null)
            .korName(command.getKorName())
            .engName(command.getEngName())
            .description(command.getDescription() != null ? command.getDescription() : "")
            .price(command.getPrice() != null ? command.getPrice() : 0)
            .categoryId(command.getCategoryId())
            .category(null)
            .isAvailable(command.getIsAvailable() != null ? command.getIsAvailable() : true)
            .isSoldOut(false)
            .sortOrder(nextSort)
            .optionsJson(command.getOptionsJson())
            .productInfoJson(command.getProductInfoJson())
            .isPopular(command.getIsPopular())
            .isNew(command.getIsNew())
            .isRecommended(command.getIsRecommended())
            .displayPriority(command.getDisplayPriority())
            .likeCount(0)
            .viewCount(0)
            .createdAt(null)
            .updatedAt(null)
            .build();
        AdminMenu saved = adminMenuRepositoryPort.save(newMenu);
        return CreateMenuResult.builder()
            .id(saved.getId())
            .build();
    }

    /**
     * 메뉴 수정
     */
    @Override
    public UpdateMenuResult updateMenu(UpdateMenuCommand command) {
        AdminMenu existing = adminMenuRepositoryPort.findById(command.getId());
        if (existing == null) {
            throw new IllegalArgumentException("Menu not found with id: " + command.getId());
        }
        String optionsJson = command.getOptionsJson() != null ? command.getOptionsJson() : existing.getOptionsJson();
        String productInfoJson = command.getProductInfoJson() != null ? command.getProductInfoJson() : existing.getProductInfoJson();
        AdminMenu toSave = AdminMenu.builder()
            .id(existing.getId())
            .korName(command.getKorName() != null ? command.getKorName() : existing.getKorName())
            .engName(command.getEngName() != null ? command.getEngName() : existing.getEngName())
            .description(command.getDescription() != null ? command.getDescription() : existing.getDescription())
            .price(command.getPrice() != null ? command.getPrice() : existing.getPrice())
            .categoryId(command.getCategoryId() != null ? command.getCategoryId() : existing.getCategoryId())
            .category(existing.getCategory())
            .isAvailable(command.getIsAvailable() != null ? command.getIsAvailable() : existing.getIsAvailable())
            .isSoldOut(existing.getIsSoldOut())
            .sortOrder(existing.getSortOrder())
            .optionsJson(optionsJson)
            .productInfoJson(productInfoJson)
            .isPopular(command.getIsPopular() != null ? command.getIsPopular() : existing.getIsPopular())
            .isNew(command.getIsNew() != null ? command.getIsNew() : existing.getIsNew())
            .isRecommended(command.getIsRecommended() != null ? command.getIsRecommended() : existing.getIsRecommended())
            .displayPriority(command.getDisplayPriority() != null ? command.getDisplayPriority() : existing.getDisplayPriority())
            .likeCount(existing.getLikeCount() != null ? existing.getLikeCount() : 0)
            .viewCount(existing.getViewCount() != null ? existing.getViewCount() : 0)
            .createdAt(existing.getCreatedAt())
            .updatedAt(existing.getUpdatedAt())
            .build();
        adminMenuRepositoryPort.save(toSave);
        return UpdateMenuResult.builder().id(toSave.getId()).build();
    }

    /**
     * 메뉴 삭제
     */
    @Override
    public void deleteMenu(DeleteMenuCommand command) {
        if (adminMenuRepositoryPort.findById(command.getId()) == null) {
            throw new IllegalArgumentException("Menu not found with id: " + command.getId());
        }
        adminMenuRepositoryPort.deleteById(command.getId());
    }

    /**
     * 메뉴 정렬 순서 변경
     */
    @Override
    public void reorderMenus(ReorderMenusCommand command) {
        if (command.getOrderedIds() == null || command.getOrderedIds().isEmpty()) {
            return;
        }
        for (int i = 0; i < command.getOrderedIds().size(); i++) {
            Long id = command.getOrderedIds().get(i);
            AdminMenu menu = adminMenuRepositoryPort.findById(id);
            if (menu != null) {
                AdminMenu toSave = AdminMenu.builder()
                    .id(menu.getId())
                    .korName(menu.getKorName())
                    .engName(menu.getEngName())
                    .description(menu.getDescription())
                    .price(menu.getPrice())
                    .categoryId(menu.getCategoryId())
                    .category(menu.getCategory())
                    .isAvailable(menu.getIsAvailable())
                    .isSoldOut(menu.getIsSoldOut())
                    .sortOrder(i)
                    .optionsJson(menu.getOptionsJson())
                    .productInfoJson(menu.getProductInfoJson())
                    .isPopular(menu.getIsPopular())
                    .isNew(menu.getIsNew())
                    .isRecommended(menu.getIsRecommended())
                    .displayPriority(menu.getDisplayPriority())
                    .likeCount(menu.getLikeCount())
                    .viewCount(menu.getViewCount())
                    .createdAt(menu.getCreatedAt())
                    .updatedAt(menu.getUpdatedAt())
                    .build();
                adminMenuRepositoryPort.save(toSave);
            }
        }
    }

    @Override
    public void addMenuImage(Long menuId, String imageSrc, int sortOrder) {
        if (adminMenuRepositoryPort.findById(menuId) == null) {
            throw new IllegalArgumentException("Menu not found: " + menuId);
        }
        List<GetMenuImageListResult.MenuImageInfo> existing = getMenuImages(menuId);
        int nextOrder = existing.size();
        AdminMenuImage image = AdminMenuImage.builder()
            .id(null)
            .menuId(menuId)
            .imageSrc(imageSrc)
            .sortOrder(nextOrder)
            .build();
        adminMenuImageRepositoryPort.save(image);
    }

    @Override
    public void reorderMenuImages(ReorderMenuImagesCommand command) {
        if (command.getOrderedImageIds() == null || command.getOrderedImageIds().isEmpty()) return;
        for (int i = 0; i < command.getOrderedImageIds().size(); i++) {
            Long imageId = command.getOrderedImageIds().get(i);
            AdminMenuImage image = adminMenuImageRepositoryPort.findById(imageId);
            if (image != null && command.getMenuId().equals(image.getMenuId())) {
                AdminMenuImage updated = AdminMenuImage.builder()
                    .id(image.getId())
                    .menuId(image.getMenuId())
                    .imageSrc(image.getImageSrc())
                    .sortOrder(i)
                    .build();
                adminMenuImageRepositoryPort.save(updated);
            }
        }
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
