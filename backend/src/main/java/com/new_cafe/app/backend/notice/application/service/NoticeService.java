package com.new_cafe.app.backend.notice.application.service;

import com.new_cafe.app.backend.notice.application.port.in.NoticeQueryUseCase;
import com.new_cafe.app.backend.notice.application.port.out.NoticeRepositoryPort;
import com.new_cafe.app.backend.notice.model.Notice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 공지사항 조회 전용 서비스 (사용자 공개 API용).
 * 관리자 CRUD는 admin.notice.AdminNoticeService 사용.
 */
@Service
public class NoticeService implements NoticeQueryUseCase {

    private final NoticeRepositoryPort noticeRepository;

    public NoticeService(NoticeRepositoryPort noticeRepository) {
        this.noticeRepository = noticeRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notice> findAll() {
        return noticeRepository.findAllOrderByCreatedAtDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Notice> findById(Long id) {
        return noticeRepository.findById(id);
    }

    @Override
    @Transactional
    public Optional<Notice> findByIdAndIncrementViewCount(Long id) {
        Optional<Notice> opt = noticeRepository.findById(id);
        opt.ifPresent(n -> {
            n.setViewCount(n.getViewCount() != null ? n.getViewCount() + 1 : 1);
            noticeRepository.save(n);
        });
        return opt;
    }
}
