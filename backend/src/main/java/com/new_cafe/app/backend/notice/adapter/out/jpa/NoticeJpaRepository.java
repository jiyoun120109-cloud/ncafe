package com.new_cafe.app.backend.notice.adapter.out.jpa;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NoticeJpaRepository extends JpaRepository<NoticeEntity, Long>, JpaSpecificationExecutor<NoticeEntity> {

    @Query("SELECT n FROM NoticeEntity n ORDER BY n.isPinned DESC, n.pinnedAt DESC, n.createdAt DESC")
    Page<NoticeEntity> findAllOrderByPinnedAndCreatedAt(Pageable pageable);

    @Query("SELECT n FROM NoticeEntity n WHERE (:q IS NULL OR :q = '' OR LOWER(n.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(n.content) LIKE LOWER(CONCAT('%', :q, '%'))) ORDER BY n.isPinned DESC, n.pinnedAt DESC, n.createdAt DESC")
    Page<NoticeEntity> searchOrderByPinnedAndCreatedAt(@Param("q") String q, Pageable pageable);
}
