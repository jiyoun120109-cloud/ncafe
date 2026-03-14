package com.new_cafe.app.backend.notice.application.port.out;

import com.new_cafe.app.backend.notice.model.Notice;

import java.util.List;
import java.util.Optional;

public interface NoticeRepositoryPort {

    List<Notice> findAllOrderByCreatedAtDesc();

    Optional<Notice> findById(Long id);

    Notice save(Notice notice);
}
