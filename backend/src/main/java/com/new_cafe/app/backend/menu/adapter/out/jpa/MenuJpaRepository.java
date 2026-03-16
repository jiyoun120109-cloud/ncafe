package com.new_cafe.app.backend.menu.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MenuJpaRepository extends JpaRepository<MenuEntity, Long> {

    @Modifying
    @Query("UPDATE Menu m SET m.likeCount = COALESCE(m.likeCount, 0) + 1 WHERE m.id = :menuId")
    void incrementLikeCount(@Param("menuId") Long menuId);

    @Modifying
    @Query("UPDATE Menu m SET m.likeCount = CASE WHEN COALESCE(m.likeCount, 0) <= 1 THEN 0 ELSE m.likeCount - 1 END WHERE m.id = :menuId")
    void decrementLikeCount(@Param("menuId") Long menuId);

    @Modifying
    @Query("UPDATE Menu m SET m.viewCount = COALESCE(m.viewCount, 0) + 1 WHERE m.id = :menuId")
    void incrementViewCount(@Param("menuId") Long menuId);
}
