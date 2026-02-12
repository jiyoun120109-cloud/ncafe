package com.new_cafe.app.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.new_cafe.app.backend.dto.MenuCreateRequest;
import com.new_cafe.app.backend.dto.MenuCreateResponse;
import com.new_cafe.app.backend.dto.MenuDetailResponse;
import com.new_cafe.app.backend.dto.MenuImageResponse;
import com.new_cafe.app.backend.dto.MenuImageListResponse;
import com.new_cafe.app.backend.dto.MenuListRequest;
import com.new_cafe.app.backend.dto.MenuListResponse;
import com.new_cafe.app.backend.dto.MenuUpdateRequest;
import com.new_cafe.app.backend.dto.MenuUpdateResponse;
import com.new_cafe.app.backend.dto.MenuResponse;
import com.new_cafe.app.backend.entity.Menu;
import com.new_cafe.app.backend.entity.MenuImage;
import com.new_cafe.app.backend.repository.CategoryRepository;
import com.new_cafe.app.backend.repository.MenuImageRepository;
import com.new_cafe.app.backend.repository.MenuRepository;

@Service // 객체를 생성하는 대신 스프링 컨테이너에 객체를 등록하는 역할
public class NewMenuService implements MenuService {

    private CategoryRepository categoryRepository;
    private MenuRepository repository;
    private MenuImageRepository menuImageRepository;

    public NewMenuService(CategoryRepository categoryRepository, MenuRepository repository,
            MenuImageRepository menuImageRepository) {
        this.categoryRepository = categoryRepository;
        this.repository = repository;
        this.menuImageRepository = menuImageRepository;
    }

    @Override
    public MenuListResponse getMenus(MenuListRequest request) {

        Integer categoryId = request.getCategoryId();
        String searchQuery = request.getSearchQuery();

        List<Menu> menus = repository.findAllByCategoryIdAndSearchQuery(categoryId, searchQuery);

        List<MenuResponse> menuResponses = menus
                .stream()
                .map(menu -> {
                    String categoryName = categoryRepository.findById(menu.getCategoryId()).getName();

                    List<MenuImage> images = menuImageRepository.findAllByMenuId(menu.getId());
                    String imageSrc = "blank.png";
                    if (images.size() > 0) {
                        imageSrc = images.get(0).getImageSrc();
                    }
                    return MenuResponse
                            .builder()
                            .id(menu.getId())
                            .korName(menu.getKorName())
                            .engName(menu.getEngName())
                            .description(menu.getDescription())
                            .price(menu.getPrice())
                            .categoryName(categoryName)
                            .imageSrc(imageSrc)
                            .isAvailable(menu.getIsAvailable())
                            .isSoldOut(false)
                            .sortOrder(1)
                            .createdAt(menu.getCreatedAt())
                            .updatedAt(menu.getUpdatedAt())
                            .build();
                })
                .toList();

        return MenuListResponse
                .builder()
                .menus(menuResponses)
                .total(100)
                .build();
    }

    @Override
    public MenuDetailResponse getMenu(long id) {
        Menu menu = repository.findById(id);

        if (menu == null) {
            return null;
        }

        String categoryName = categoryRepository.findById(menu.getCategoryId()).getName();

        return MenuDetailResponse.builder()
                .id(menu.getId())
                .korName(menu.getKorName())
                .engName(menu.getEngName())
                .categoryName(categoryName)
                .price(menu.getPrice())
                .isAvailable(menu.getIsAvailable())
                .createdAt(menu.getCreatedAt())
                .updatedAt(menu.getUpdatedAt())
                .description(menu.getDescription())
                .build();
    }

    @Override
    public MenuCreateResponse createMenu(MenuCreateRequest request) {
        return null;
    }

    @Override
    public MenuUpdateResponse updateMenu(MenuUpdateRequest request) {
        return null;
    }

    @Override
    public void deleteMenu(long id) {
    }

    @Override
    public MenuImageListResponse getMenuImageList(long menuId) {

        List<MenuImage> images = menuImageRepository.findAllByMenuId(menuId);

        Menu menu = repository.findById(menuId);
        String altText = (menu != null) ? menu.getKorName() : "";

        List<MenuImageResponse> imageDtos = images
                .stream()
                .map(image -> MenuImageResponse.builder()
                        .id(image.getId())
                        .imageUrl(image.getImageSrc())
                        .menuId(image.getMenuId())
                        .sortOrder(image.getSortOrder())
                        .build())
                .toList();

        return MenuImageListResponse.builder()
                .menuImages(imageDtos)
                .altText(altText)
                .build();
    }

}
