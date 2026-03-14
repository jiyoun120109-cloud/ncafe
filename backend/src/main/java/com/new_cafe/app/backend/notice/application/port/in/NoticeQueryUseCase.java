package com.new_cafe.app.backend.notice.application.port.in;

import com.new_cafe.app.backend.notice.model.Notice;

import java.util.List;
import java.util.Optional;

/** 사용자 공지사항 조회 (목록/상세, 조회수 증가) */
public interface NoticeQueryUseCase {

    List<Notice> findAll();

    Optional<Notice> findById(Long id);

    Optional<Notice> findByIdAndIncrementViewCount(Long id);
}
