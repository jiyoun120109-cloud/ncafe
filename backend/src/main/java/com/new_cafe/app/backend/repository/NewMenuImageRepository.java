package com.new_cafe.app.backend.repository;

import java.sql.Statement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import javax.sql.DataSource;

import org.springframework.stereotype.Repository;

import com.new_cafe.app.backend.entity.MenuImage;

@Repository
public class NewMenuImageRepository implements MenuImageRepository {

    private DataSource dataSource;

    public NewMenuImageRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public List<MenuImage> findAllByMenuId(Long menuId) {
        List<MenuImage> images = new ArrayList<>();
        String sql = "SELECT * FROM menu_images WHERE menu_id = " + menuId + " ORDER BY sort_order ASC";

        try (Connection conn = dataSource.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                images.add(MenuImage.builder()
                        .id(rs.getLong("id"))
                        .menuId(rs.getLong("menu_id"))
                        .imageSrc(rs.getString("src_url"))
                        .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
                        .sortOrder(rs.getInt("sort_order"))
                        .build());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return images;
    }
}
