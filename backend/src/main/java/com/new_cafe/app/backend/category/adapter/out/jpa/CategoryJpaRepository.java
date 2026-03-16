package com.new_cafe.app.backend.category.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface CategoryJpaRepository extends JpaRepository<CategoryEntity, Long> {

    @Query("SELECT MAX(c.displayOrder) FROM Category c")
    Optional<Integer> findMaxDisplayOrder();

    /** 목록 노출 순서: displayOrder 오름차순, 동일 시 ID 오름차순 */
    java.util.List<CategoryEntity> findAllByOrderByDisplayOrderAscIdAsc();
}
