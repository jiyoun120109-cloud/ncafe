package com.new_cafe.app.backend.menu.adapter.in.web;

import com.new_cafe.app.backend.menu.adapter.in.web.dto.*;
import com.new_cafe.app.backend.menu.application.command.MenuListCommand;
import com.new_cafe.app.backend.menu.application.command.GetMenuCommand;
import com.new_cafe.app.backend.menu.application.command.GetMenuImageListCommand;
import com.new_cafe.app.backend.menu.application.result.MenuListResult;
import com.new_cafe.app.backend.menu.application.result.MenuListResult.MenuInfo;
import com.new_cafe.app.backend.menu.application.result.GetMenuResult;
import com.new_cafe.app.backend.menu.application.result.GetMenuImageListResult;
import com.new_cafe.app.backend.menu.application.port.in.UserMenuUseCase;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;

/**
 * 일반 사용자용 공개 메뉴 API (Public Interface)
 */
@RestController
@RequestMapping("/api/menus")
public class MenuController {

    private final UserMenuUseCase userMenuUseCase;

    public MenuController(UserMenuUseCase userMenuUseCase) {
        this.userMenuUseCase = userMenuUseCase;
    }

    /**
     * 메뉴 목록 조회
     * HTTP GET /api/menus?categoryId=1&searchQuery=keyword
     */
    @GetMapping
    public MenuListResponseDto menu(MenuListRequestDto request) {
        // HTTP DTO → Command
        MenuListCommand command = MenuListCommand.builder()
            .categoryId(request.getCategoryId())
            .searchQuery(request.getSearchQuery())
            .build();

        // UseCase 실행
        MenuListResult result = userMenuUseCase.getMenus(command);

        // Result → HTTP Response DTO
        return MenuListResponseDto.builder()
            .menus(result.getMenus().stream()
                .map(this::convertMenuInfoToDto)
                .collect(Collectors.toList()))
            .total(result.getTotal())
            .build();
    }

    /**
     * 단일 메뉴 상세 조회
     * HTTP GET /api/menus/{id}
     */
    @GetMapping("/{id}")
    public MenuDetailResponseDto detailMenu(@PathVariable Long id) {
        // HTTP PathVariable → Command
        GetMenuCommand command = GetMenuCommand.builder()
            .id(id)
            .build();

        // UseCase 실행
        GetMenuResult result = userMenuUseCase.getMenu(command);

        // Result → HTTP Response DTO
        return MenuDetailResponseDto.builder()
            .id(result.getId())
            .korName(result.getKorName())
            .engName(result.getEngName())
            .categoryName(result.getCategoryName())
            .price(result.getPrice())
            .isAvailable(result.getIsAvailable())
            .description(result.getDescription())
            .createdAt(result.getCreatedAt())
            .updatedAt(result.getUpdatedAt())
            .build();
    }

    /**
     * 메뉴 이미지 목록 조회
     * HTTP GET /api/menus/{id}/menu-images
     */
    @GetMapping("/{id}/menu-images")
    public MenuImageListResponseDto menuImageList(@PathVariable Long id) {
        // HTTP PathVariable → Command
        GetMenuImageListCommand command = GetMenuImageListCommand.builder()
            .menuId(id)
            .build();

        // UseCase 실행
        GetMenuImageListResult result = userMenuUseCase.getMenuImageList(command);

        // Result → HTTP Response DTO
        return MenuImageListResponseDto.builder()
            .menuImages(result.getMenuImages().stream()
                .map(this::convertMenuImageInfoToDto)
                .collect(Collectors.toList()))
            .altText(result.getAltText())
            .build();
    }

    /**
     * MenuInfo를 MenuResponseDto로 변환
     */
    private MenuResponseDto convertMenuInfoToDto(MenuInfo menuInfo) {
        return MenuResponseDto.builder()
            .id(menuInfo.getId())
            .korName(menuInfo.getKorName())
            .engName(menuInfo.getEngName())
            .price(menuInfo.getPrice())
            .categoryName(menuInfo.getCategoryName())
            .imageSrc(menuInfo.getImageSrc())
            .isAvailable(menuInfo.getIsAvailable())
            .description(menuInfo.getDescription())
            .createdAt(menuInfo.getCreatedAt())
            .updatedAt(menuInfo.getUpdatedAt())
            .build();
    }

    /**
     * MenuImageInfo를 MenuImageResponseDto로 변환
     */
    private MenuImageResponseDto convertMenuImageInfoToDto(GetMenuImageListResult.MenuImageInfo imageInfo) {
        return MenuImageResponseDto.builder()
            .id(imageInfo.getId())
            .imageUrl(imageInfo.getImageUrl())
            .menuId(imageInfo.getMenuId())
            .sortOrder(imageInfo.getSortOrder())
            .build();
    }
}
