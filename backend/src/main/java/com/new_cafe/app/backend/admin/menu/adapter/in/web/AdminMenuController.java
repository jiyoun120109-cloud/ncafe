package com.new_cafe.app.backend.admin.menu.adapter.in.web;

import com.new_cafe.app.backend.admin.menu.application.port.in.AdminMenuUseCase;
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
import com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.req.CreateMenuRequestDto;
import com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.req.MenuListRequestDto;
import com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.req.UpdateMenuRequestDto;
import com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.res.CreateMenuResponseDto;
import com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.res.MenuDetailResponseDto;
import com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.res.MenuImageListResponseDto;
import com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.res.MenuImageResponseDto;
import com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.res.MenuListResponseDto;
import com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.res.MenuResponseDto;
import com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.res.UpdateMenuResponseDto;

import org.springframework.web.bind.annotation.*;

/**
 * 관리자 전용 메뉴 API (Admin-Only Interface)
 */
@RestController 
@RequestMapping("/api/admin/menus")
public class AdminMenuController {

    private final AdminMenuUseCase adminMenuUseCase;

    public AdminMenuController(AdminMenuUseCase adminMenuUseCase) {
        this.adminMenuUseCase = adminMenuUseCase;
    }

    @GetMapping
    public MenuListResponseDto menu(MenuListRequestDto request) {
        MenuListCommand command = MenuListCommand.builder()
                .categoryId(request.getCategoryId())
                .searchQuery(request.getSearchQuery())
                .build();

        MenuListResult result = adminMenuUseCase.getMenus(command);
        return convertToResponseDto(result);
    }

    @PostMapping("/")
    public CreateMenuResponseDto createMenu(@RequestBody CreateMenuRequestDto request) {
        CreateMenuCommand command = CreateMenuCommand.builder()
                .korName(request.getKorName())
                .engName(request.getEngName())
                .description(request.getDescription())
                .price(request.getPrice())
                .categoryId(request.getCategoryId())
                .isAvailable(request.getIsAvailable())
                .build();

        CreateMenuResult result = adminMenuUseCase.createMenu(command);
        return CreateMenuResponseDto.builder()
                .id(result.getId())
                .build();
    }

    @PutMapping("/{id}")
    public UpdateMenuResponseDto updateMenu(@PathVariable Long id, @RequestBody UpdateMenuRequestDto request) {
        UpdateMenuCommand command = UpdateMenuCommand.builder()
                .id(id)
                .korName(request.getKorName())
                .engName(request.getEngName())
                .description(request.getDescription())
                .price(request.getPrice())
                .categoryId(request.getCategoryId())
                .isAvailable(request.getIsAvailable())
                .build();

        UpdateMenuResult result = adminMenuUseCase.updateMenu(command);
        return UpdateMenuResponseDto.builder()
                .id(result.getId())
                .build();
    }

    @DeleteMapping("/{id}")
    public void deleteMenu(@PathVariable Long id) {
        DeleteMenuCommand command = DeleteMenuCommand.builder()
                .id(id)
                .build();
        adminMenuUseCase.deleteMenu(command);
    }

    @GetMapping("/{id}")
    public MenuDetailResponseDto getMenu(@PathVariable Long id) {
        GetMenuCommand command = GetMenuCommand.builder()
                .id(id)
                .build();

        GetMenuResult result = adminMenuUseCase.getMenu(command);
        return MenuDetailResponseDto.builder()
                .id(result.getId())
                .korName(result.getKorName())
                .engName(result.getEngName())
                .description(result.getDescription())
                .price(result.getPrice())
                .categoryName(result.getCategoryName())
                .isAvailable(result.getIsAvailable())
                .createdAt(result.getCreatedAt())
                .updatedAt(result.getUpdatedAt())
                .build();
    }

    @GetMapping("/{id}/menu-images")
    public MenuImageListResponseDto getMenuImageList(@PathVariable Long id) {
        GetMenuImageListCommand command = GetMenuImageListCommand.builder()
                .menuId(id)
                .build();

        GetMenuImageListResult result = adminMenuUseCase.getMenuImageList(command);
        return MenuImageListResponseDto.builder()
                .menuImages(result.getMenuImages().stream()
                        .map(img -> MenuImageResponseDto.builder()
                                .id(img.getId())
                                .imageUrl(img.getImageUrl())
                                .menuId(img.getMenuId())
                                .sortOrder(img.getSortOrder())
                                .build())
                        .collect(java.util.stream.Collectors.toList()))
                .altText(result.getAltText())
                .build();
    }

    private MenuListResponseDto convertToResponseDto(MenuListResult result) {
        return MenuListResponseDto.builder()
                .menus(result.getMenus().stream()
                        .map(menu -> MenuResponseDto.builder()
                                .id(menu.getId())
                                .korName(menu.getKorName())
                                .engName(menu.getEngName())
                                .description(menu.getDescription())
                                .price(menu.getPrice())
                                .categoryName(menu.getCategoryName())
                                .imageSrc(menu.getImageSrc())
                                .isAvailable(menu.getIsAvailable())
                                .createdAt(menu.getCreatedAt())
                                .updatedAt(menu.getUpdatedAt())
                                .build())
                        .collect(java.util.stream.Collectors.toList()))
                .total(result.getTotal())
                .build();
    }
}
