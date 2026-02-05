package com.new_cafe.app.backend.controller.admin;

import java.sql.SQLException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.new_cafe.app.backend.entity.Category;
import com.new_cafe.app.backend.service.CategoryService;

@RestController
@RequestMapping("/admin/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // 목록
    @GetMapping
    public List<Category> getCategories() throws ClassNotFoundException, SQLException {
        return categoryService.getAll();
    }

    // 상세
    @GetMapping("/{id}")
    public String getDetail() {
        return "Detail category";
    }

    // 등록
    @PostMapping
    public String getCreate() {
        return "Create category";
    }

    // 수정
    @PutMapping("/{id}")
    public String getUpdate() {
        return "Update category";
    }

    // 삭제
    @DeleteMapping("/{id}")
    public String getDelete() {
        return "Delete category";
    }

}
