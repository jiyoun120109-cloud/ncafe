package com.new_cafe.app.backend.service;

import java.sql.SQLException;
import java.util.List;

import org.springframework.stereotype.Service;

import com.new_cafe.app.backend.entity.Category;
import com.new_cafe.app.backend.repository.CategoryRepository;

@Service
public class NewCategoryService implements CategoryService {

    private CategoryRepository repository;

    public NewCategoryService(CategoryRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Category> getAll() throws ClassNotFoundException, SQLException {
        return repository.findAll();
    }
}
