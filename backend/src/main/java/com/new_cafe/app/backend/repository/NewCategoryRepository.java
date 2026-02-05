package com.new_cafe.app.backend.repository;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import javax.sql.DataSource;

import org.springframework.stereotype.Repository;

import com.new_cafe.app.backend.entity.Category;

@Repository
public class NewCategoryRepository implements CategoryRepository {

    private DataSource dataSource;

    public NewCategoryRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public List<Category> findAll() {
        List<Category> categories = new ArrayList<>();
        String sql = "SELECT * FROM categories";

        try (Connection conn = dataSource.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                categories.add(Category.builder()
                        .id(rs.getLong("id"))
                        .name(rs.getString("name"))
                        .build());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return categories;
    }

    @Override
    public Category findById(Long id) {
        String sql = "SELECT * FROM categories WHERE id = " + id;

        try (Connection conn = dataSource.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) {
                return Category.builder()
                        .id(rs.getLong("id"))
                        .name(rs.getString("name"))
                        .build();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

}
