package com.new_cafe.app.backend.notice.adapter.out.persistence;

import com.new_cafe.app.backend.notice.application.port.out.NoticeRepositoryPort;
import com.new_cafe.app.backend.notice.adapter.out.jpa.NoticeEntity;
import com.new_cafe.app.backend.notice.adapter.out.jpa.NoticeJpaRepository;
import com.new_cafe.app.backend.notice.model.Notice;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class NoticePersistenceAdapter implements NoticeRepositoryPort {

    private final NoticeJpaRepository noticeJpaRepository;

    public NoticePersistenceAdapter(NoticeJpaRepository noticeJpaRepository) {
        this.noticeJpaRepository = noticeJpaRepository;
    }

    @Override
    public List<Notice> findAllOrderByCreatedAtDesc() {
        return noticeJpaRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Notice> findById(Long id) {
        return noticeJpaRepository.findById(id).map(this::toModel);
    }

    @Override
    public Notice save(Notice notice) {
        NoticeEntity entity = toEntity(notice);
        NoticeEntity saved = noticeJpaRepository.save(entity);
        return toModel(saved);
    }

    private Notice toModel(NoticeEntity e) {
        return Notice.builder()
                .id(e.getId())
                .title(e.getTitle())
                .content(e.getContent())
                .authorId(e.getAuthorId())
                .noticeType(e.getNoticeType())
                .viewCount(e.getViewCount() != null ? e.getViewCount() : 0)
                .isPinned(e.getIsPinned() != null ? e.getIsPinned() : false)
                .pinnedAt(e.getPinnedAt())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private NoticeEntity toEntity(Notice m) {
        return NoticeEntity.builder()
                .id(m.getId())
                .title(m.getTitle())
                .content(m.getContent())
                .authorId(m.getAuthorId())
                .noticeType(m.getNoticeType())
                .viewCount(m.getViewCount())
                .isPinned(m.getIsPinned())
                .pinnedAt(m.getPinnedAt())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
