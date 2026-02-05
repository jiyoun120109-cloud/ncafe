package com.new_cafe.app.backend.repository;

import java.sql.Statement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import javax.sql.DataSource;

import org.springframework.stereotype.Repository;

import com.new_cafe.app.backend.entity.Menu;

@Repository
public class NewMenuRepository implements MenuRepository {

    private DataSource dataSource;

    public NewMenuRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public List<Menu> findAll() {
        return findAllByCategoryIdAndSearchQuery(null, null);
    }

    @Override
    public List<Menu> findAllByCategoryIdAndSearchQuery(Integer categoryId, String searchQuery) {
        List<Menu> menus = new ArrayList<>();
        String sql = "SELECT * FROM menus WHERE 1=1";

        if (categoryId != null) {
            sql += " AND category_id = " + categoryId;
        }

        if (searchQuery != null && !searchQuery.isEmpty()) {
            sql += " AND kor_name LIKE '%" + searchQuery + "%'";
        }

        try (Connection conn = dataSource.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                menus.add(Menu.builder()
                        .id(rs.getLong("id"))
                        .korName(rs.getString("kor_name"))
                        .engName(rs.getString("eng_name"))
                        .categoryId(
                                rs.getObject("category_id") != null ? ((Number) rs.getObject("category_id")).longValue()
                                        : null)
                        .price(rs.getInt("price"))
                        .description(rs.getString("description"))
                        .isAvailable(rs.getBoolean("is_available"))
                        .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
                        .updatedAt(rs.getTimestamp("updated_at").toLocalDateTime())
                        .build());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return menus;
    }

    @Override
    public List<Menu> findAllByCategoryId(Integer categoryId) {
        List<Menu> menus = new ArrayList<>();
        String sql = "SELECT * FROM menus";

        if (categoryId != null) {
            sql += " WHERE category_id = " + categoryId;
        }

        try (Connection conn = dataSource.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                menus.add(Menu.builder()
                        .id(rs.getLong("id"))
                        .korName(rs.getString("kor_name"))
                        .engName(rs.getString("eng_name"))
                        .categoryId(
                                rs.getObject("category_id") != null ? ((Number) rs.getObject("category_id")).longValue()
                                        : null)
                        .price(rs.getInt("price"))
                        .description(rs.getString("description"))
                        .isAvailable(rs.getBoolean("is_available"))
                        .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
                        .updatedAt(rs.getTimestamp("updated_at").toLocalDateTime())
                        .build());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return menus;

    }

    @Override
    public List<Menu> findAllByName(String name) {
        List<Menu> menus = new ArrayList<>();
        String sql = "SELECT * FROM menus WHERE kor_name LIKE '%" + name + "%'";

        try (Connection conn = dataSource.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                menus.add(Menu.builder()
                        .id(rs.getLong("id"))
                        .korName(rs.getString("kor_name"))
                        .engName(rs.getString("eng_name"))
                        .price(rs.getInt("price"))
                        .categoryId(
                                rs.getObject("category_id") != null ? ((Number) rs.getObject("category_id")).longValue()
                                        : null)
                        .description(rs.getString("description"))
                        .isAvailable(rs.getBoolean("is_available"))
                        .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
                        .updatedAt(rs.getTimestamp("updated_at").toLocalDateTime())
                        .build());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return menus;
    }
}
