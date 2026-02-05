package com.new_cafe.app.backend.service;

import java.sql.SQLException;
import java.util.List;

import com.new_cafe.app.backend.entity.Category;

public interface CategoryService {

    public List<Category> getAll() throws ClassNotFoundException, SQLException;

}
