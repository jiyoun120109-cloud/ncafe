package com.new_cafe.app.backend.admin.notice.application.port.out;

import com.new_cafe.app.backend.notice.model.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AdminNoticeRepositoryPort {

    Page<Notice> findAllOrderByPinnedAndCreatedAt(Pageable pageable);

    Page<Notice> searchOrderByPinnedAndCreatedAt(String search, Pageable pageable);

    Page<Notice> findWithFilters(String search, String noticeType, LocalDate fromDate, LocalDate toDate, Pageable pageable);

    Optional<Notice> findById(Long id);

    Notice save(Notice notice);

    void deleteById(Long id);

    void deleteAllById(List<Long> ids);

    List<Notice> findAllOrderByPinnedAndCreatedAt();
}
