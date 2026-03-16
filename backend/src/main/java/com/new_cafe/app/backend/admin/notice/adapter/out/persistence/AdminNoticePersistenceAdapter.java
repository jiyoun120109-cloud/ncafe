package com.new_cafe.app.backend.admin.notice.adapter.out.persistence;

import com.new_cafe.app.backend.admin.notice.application.port.out.AdminNoticeRepositoryPort;
import com.new_cafe.app.backend.notice.adapter.out.jpa.NoticeEntity;
import com.new_cafe.app.backend.notice.adapter.out.jpa.NoticeJpaRepository;
import com.new_cafe.app.backend.notice.model.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class AdminNoticePersistenceAdapter implements AdminNoticeRepositoryPort {

    private final NoticeJpaRepository noticeJpaRepository;

    public AdminNoticePersistenceAdapter(NoticeJpaRepository noticeJpaRepository) {
        this.noticeJpaRepository = noticeJpaRepository;
    }

    @Override
    public Page<Notice> findAllOrderByPinnedAndCreatedAt(Pageable pageable) {
        Page<NoticeEntity> page = noticeJpaRepository.findAllOrderByPinnedAndCreatedAt(pageable);
        return new PageImpl<>(
                page.getContent().stream().map(this::toModel).collect(Collectors.toList()),
                page.getPageable(),
                page.getTotalElements()
        );
    }

    @Override
    public Page<Notice> searchOrderByPinnedAndCreatedAt(String search, Pageable pageable) {
        Page<NoticeEntity> page = noticeJpaRepository.searchOrderByPinnedAndCreatedAt(search, pageable);
        return new PageImpl<>(
                page.getContent().stream().map(this::toModel).collect(Collectors.toList()),
                page.getPageable(),
                page.getTotalElements()
        );
    }

    @Override
    public Page<Notice> findWithFilters(String search, String noticeType, LocalDate fromDate, LocalDate toDate, Pageable pageable) {
        Specification<NoticeEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("content")), pattern)
                ));
            }
            if (noticeType != null && !noticeType.isBlank()) {
                predicates.add(cb.equal(root.get("noticeType"), noticeType.trim()));
            }
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate.atStartOfDay()));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), LocalDateTime.of(toDate, LocalTime.MAX)));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        Pageable withSort = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Order.desc("isPinned"),
                        org.springframework.data.domain.Sort.Order.desc("pinnedAt"),
                        org.springframework.data.domain.Sort.Order.desc("createdAt")
                ));
        Page<NoticeEntity> page = noticeJpaRepository.findAll(spec, withSort);
        return new PageImpl<>(
                page.getContent().stream().map(this::toModel).collect(Collectors.toList()),
                page.getPageable(),
                page.getTotalElements()
        );
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

    @Override
    public void deleteById(Long id) {
        noticeJpaRepository.deleteById(id);
    }

    @Override
    public void deleteAllById(List<Long> ids) {
        if (ids != null && !ids.isEmpty()) {
            noticeJpaRepository.deleteAllById(ids);
        }
    }

    @Override
    public List<Notice> findAllOrderByPinnedAndCreatedAt() {
        return noticeJpaRepository.findAllOrderByPinnedAndCreatedAt(PageRequest.of(0, Integer.MAX_VALUE))
                .getContent().stream().map(this::toModel).collect(Collectors.toList());
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
