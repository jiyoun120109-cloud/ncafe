package com.new_cafe.app.backend.admin.menu.adapter.in.web;

import com.new_cafe.app.backend.admin.menu.application.port.in.AdminMenuUseCase;
import com.new_cafe.app.backend.admin.menu.application.command.CreateMenuCommand;
import com.new_cafe.app.backend.admin.menu.application.command.UpdateMenuCommand;
import com.new_cafe.app.backend.admin.menu.application.command.DeleteMenuCommand;
import com.new_cafe.app.backend.admin.menu.application.command.ReorderMenusCommand;
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
import com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.req.ReorderMenusRequestDto;
import com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.req.UpdateMenuRequestDto;
import com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.res.CreateMenuResponseDto;
import com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.res.MenuDetailResponseDto;
import com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.res.MenuImageListResponseDto;
import com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.res.MenuImageResponseDto;
import com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.res.MenuListResponseDto;
import com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.res.MenuResponseDto;
import com.new_cafe.app.backend.admin.menu.adapter.in.web.dto.res.UpdateMenuResponseDto;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;

/**
 * 관리자 전용 메뉴 API (Admin-Only Interface)
 */
@RestController
@RequestMapping("/api/admin/menus")
public class AdminMenuController {

    private final AdminMenuUseCase adminMenuUseCase;

    @Value("${app.upload.dir:./upload}")
    private String uploadDir;

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

    @PostMapping(value = {"", "/"})
    public CreateMenuResponseDto createMenu(@RequestBody CreateMenuRequestDto request) {
        CreateMenuCommand command = CreateMenuCommand.builder()
                .korName(request.getKorName())
                .engName(request.getEngName())
                .description(request.getDescription())
                .price(request.getPrice())
                .categoryId(request.getCategoryId())
                .isAvailable(request.getIsAvailable())
                .optionsJson(request.getOptionsJson())
                .productInfoJson(request.getProductInfoJson())
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
                .optionsJson(request.getOptionsJson())
                .productInfoJson(request.getProductInfoJson())
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

    @PutMapping("/reorder")
    public void reorderMenus(@RequestBody ReorderMenusRequestDto request) {
        ReorderMenusCommand command = ReorderMenusCommand.builder()
                .orderedIds(request.getOrderedIds() != null ? request.getOrderedIds() : java.util.Collections.emptyList())
                .build();
        adminMenuUseCase.reorderMenus(command);
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
            .categoryId(result.getCategoryId())
            .description(result.getDescription())
            .price(result.getPrice())
            .categoryName(result.getCategoryName())
            .isAvailable(result.getIsAvailable())
            .optionsJson(result.getOptionsJson())
            .productInfoJson(result.getProductInfoJson())
            .createdAt(result.getCreatedAt())
            .updatedAt(result.getUpdatedAt())
            .build();
    }

    @PostMapping("/{id}/images")
    public void addMenuImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
        String ext = Optional.ofNullable(file.getOriginalFilename())
            .filter(n -> n.contains("."))
            .map(n -> n.substring(n.lastIndexOf(".")))
            .orElse(".jpg");
        String safeName = UUID.randomUUID().toString().replace("-", "") + ext;
        String dirPath = uploadDir.replaceFirst("^file:", "").trim();
        Path dir = Paths.get(dirPath).toAbsolutePath().normalize();
        if (!Files.exists(dir)) {
            Files.createDirectories(dir);
        }
        Path target = dir.resolve(safeName);
        file.transferTo(target);
        adminMenuUseCase.addMenuImage(id, safeName, 0);
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
