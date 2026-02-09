package com.new_cafe.app.backend.controller.admin;

import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.new_cafe.app.backend.dto.MenuDetailResponse;
import com.new_cafe.app.backend.dto.MenuImageListResponse;
import com.new_cafe.app.backend.dto.MenuListRequest;
import com.new_cafe.app.backend.dto.MenuListResponse;
import com.new_cafe.app.backend.service.MenuService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;

@RestController
@RequestMapping("/admin/menus")
public class MenuController {

    private MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    // @Autowired //Setter Injection
    // public setMenuService(MenuService menuService) {
    // this.menuService = menuService;
    // }

    // @Autowired //Filed Injection <-Private때문에 권장하지 않음
    // private MenuService menuService;

    // @Autowired //Constructor Injection <-이게 가장안전, 권장,@Autowired안써도됨
    // public MenuController(MenuService menuService) {
    // this.menuService = menuService;
    // }

    // 목록
    @GetMapping

    public MenuListResponse menu(MenuListRequest request) {
        MenuListResponse response = menuService.getMenus(request);
        return response;
    }

    // 상세
    @GetMapping("/{id}")
    public MenuDetailResponse detailMenu(@PathVariable Long id) {
        MenuDetailResponse response = menuService.getMenu(id);
        return response;
    }

    // 메뉴 이미지 목록
    @GetMapping("/{id}/menu-images")
    public MenuImageListResponse menuImageList(@PathVariable Long id) {
        MenuImageListResponse response = menuService.getMenuImageList(id);
        return response;
    }

    // 등록
    @PostMapping("/")
    public String createMenu() {
        return "Create menu";
    }

    // 수정
    @PutMapping("/{id}")
    public String updateMenu() {
        return "Update menu";
    }

    // 삭제
    @DeleteMapping("/{id}")
    public String deleteMenu() {
        return "Delete menu";
    }

}
