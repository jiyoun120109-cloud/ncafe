package com.new_cafe.app.backend.notice.application.service;

import com.new_cafe.app.backend.notice.adapter.out.jpa.NoticeEntity;
import com.new_cafe.app.backend.notice.adapter.out.jpa.NoticeJpaRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 공지사항 조회 전용 서비스 (사용자 공개 API용).
 * 관리자 CRUD는 admin.notice.AdminNoticeService 사용.
 */
@Service
public class NoticeService {

    private final NoticeJpaRepository noticeJpaRepository;

    public NoticeService(NoticeJpaRepository noticeJpaRepository) {
        this.noticeJpaRepository = noticeJpaRepository;
    }

    @Transactional(readOnly = true)
    public List<NoticeEntity> findAll() {
        return noticeJpaRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @Transactional(readOnly = true)
    public Optional<NoticeEntity> findById(Long id) {
        return noticeJpaRepository.findById(id);
    }

    @Transactional
    public Optional<NoticeEntity> findByIdAndIncrementViewCount(Long id) {
        Optional<NoticeEntity> opt = noticeJpaRepository.findById(id);
        opt.ifPresent(n -> {
            n.setViewCount(n.getViewCount() != null ? n.getViewCount() + 1 : 1);
            noticeJpaRepository.save(n);
        });
        return opt;
    }
}
