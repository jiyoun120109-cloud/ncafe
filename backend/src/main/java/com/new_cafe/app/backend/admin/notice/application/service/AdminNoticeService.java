package com.new_cafe.app.backend.admin.notice.application.service;

import com.new_cafe.app.backend.admin.notice.application.command.*;
import com.new_cafe.app.backend.admin.notice.application.port.in.AdminNoticeUseCase;
import com.new_cafe.app.backend.admin.notice.application.result.NoticeDetailResult;
import com.new_cafe.app.backend.admin.notice.application.result.NoticeListResult;
import com.new_cafe.app.backend.auth.adapter.out.jpa.UserEntity;
import com.new_cafe.app.backend.auth.adapter.out.jpa.UserJpaRepository;
import com.new_cafe.app.backend.notice.adapter.out.jpa.NoticeEntity;
import com.new_cafe.app.backend.notice.adapter.out.jpa.NoticeJpaRepository;
import com.new_cafe.app.backend.notification.adapter.out.jpa.NotificationEntity;
import com.new_cafe.app.backend.notification.adapter.out.jpa.NotificationJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminNoticeService implements AdminNoticeUseCase {

    private final NoticeJpaRepository noticeJpaRepository;
    private final NotificationJpaRepository notificationJpaRepository;
    private final UserJpaRepository userJpaRepository;

    public AdminNoticeService(NoticeJpaRepository noticeJpaRepository,
                              NotificationJpaRepository notificationJpaRepository,
                              UserJpaRepository userJpaRepository) {
        this.noticeJpaRepository = noticeJpaRepository;
        this.notificationJpaRepository = notificationJpaRepository;
        this.userJpaRepository = userJpaRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public NoticeListResult getNoticeList(NoticeListCommand command) {
        PageRequest pageable = PageRequest.of(command.getPage(), command.getSize());
        Page<NoticeEntity> paged = findPaged(pageable, command.getSearch());
        List<NoticeListResult.NoticeItem> items = paged.getContent().stream()
                .map(this::toNoticeItem)
                .collect(Collectors.toList());
        return NoticeListResult.builder()
                .content(items)
                .totalPages(paged.getTotalPages())
                .totalElements(paged.getTotalElements())
                .number(paged.getNumber())
                .size(paged.getSize())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<NoticeDetailResult> getNotice(GetNoticeCommand command) {
        Optional<NoticeEntity> opt = command.isIncrementView()
                ? findByIdAndIncrementViewCount(command.getId())
                : noticeJpaRepository.findById(command.getId());
        return opt.map(this::toDetailResult);
    }

    @Override
    @Transactional
    public NoticeDetailResult createNotice(CreateNoticeCommand command) {
        LocalDateTime now = LocalDateTime.now();
        NoticeEntity notice = NoticeEntity.builder()
                .noticeType(command.getNoticeType() != null && !command.getNoticeType().isBlank() ? command.getNoticeType() : "일반")
                .title(command.getTitle())
                .content(command.getContent() != null ? command.getContent() : "")
                .authorId(command.getAuthorId())
                .viewCount(0)
                .isPinned(Boolean.TRUE.equals(command.getIsPinned()))
                .pinnedAt(Boolean.TRUE.equals(command.getIsPinned()) ? now : null)
                .createdAt(now)
                .updatedAt(now)
                .build();
        notice = noticeJpaRepository.save(notice);
        for (UserEntity user : userJpaRepository.findAll()) {
            if ("USER".equals(user.getRole())) {
                String msg = notice.getContent();
                NotificationEntity n = NotificationEntity.builder()
                        .userId(user.getId())
                        .type("NOTICE")
                        .refId(notice.getId())
                        .title("새 공지: " + notice.getTitle())
                        .message(msg != null && msg.length() > 100 ? msg.substring(0, 100) + "..." : msg)
                        .createdAt(now)
                        .build();
                notificationJpaRepository.save(n);
            }
        }
        return toDetailResult(notice);
    }

    @Override
    @Transactional
    public Optional<NoticeDetailResult> updateNotice(UpdateNoticeCommand command) {
        return noticeJpaRepository.findById(command.getId()).map(n -> {
            if (command.getNoticeType() != null) n.setNoticeType(command.getNoticeType());
            if (command.getTitle() != null) n.setTitle(command.getTitle());
            if (command.getContent() != null) n.setContent(command.getContent());
            if (command.getIsPinned() != null) {
                n.setIsPinned(command.getIsPinned());
                n.setPinnedAt(command.getIsPinned() ? LocalDateTime.now() : null);
            }
            n.setUpdatedAt(LocalDateTime.now());
            return noticeJpaRepository.save(n);
        }).map(this::toDetailResult);
    }

    @Override
    @Transactional
    public Optional<NoticeDetailResult> togglePin(Long id) {
        return noticeJpaRepository.findById(id).map(n -> {
            n.setIsPinned(!Boolean.TRUE.equals(n.getIsPinned()));
            n.setPinnedAt(n.getIsPinned() ? LocalDateTime.now() : null);
            return noticeJpaRepository.save(n);
        }).map(this::toDetailResult);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<NoticeDetailResult> getPrev(Long currentId) {
        List<NoticeEntity> all = noticeJpaRepository.findAllOrderByPinnedAndCreatedAt(PageRequest.of(0, Integer.MAX_VALUE)).getContent();
        int idx = indexOf(all, currentId);
        if (idx <= 0) return Optional.empty();
        return Optional.of(toDetailResult(all.get(idx - 1)));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<NoticeDetailResult> getNext(Long currentId) {
        List<NoticeEntity> all = noticeJpaRepository.findAllOrderByPinnedAndCreatedAt(PageRequest.of(0, Integer.MAX_VALUE)).getContent();
        int idx = indexOf(all, currentId);
        if (idx < 0 || idx >= all.size() - 1) return Optional.empty();
        return Optional.of(toDetailResult(all.get(idx + 1)));
    }

    @Override
    @Transactional
    public void deleteNotice(Long id) {
        noticeJpaRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteNotices(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return;
        noticeJpaRepository.deleteAllById(ids);
    }

    private Page<NoticeEntity> findPaged(PageRequest pageable, String search) {
        if (search != null && !search.isBlank()) {
            return noticeJpaRepository.searchOrderByPinnedAndCreatedAt(search.trim(), pageable);
        }
        return noticeJpaRepository.findAllOrderByPinnedAndCreatedAt(pageable);
    }

    private Optional<NoticeEntity> findByIdAndIncrementViewCount(Long id) {
        Optional<NoticeEntity> opt = noticeJpaRepository.findById(id);
        opt.ifPresent(n -> {
            n.setViewCount(n.getViewCount() != null ? n.getViewCount() + 1 : 1);
            noticeJpaRepository.save(n);
        });
        return opt;
    }

    private int indexOf(List<NoticeEntity> all, Long id) {
        for (int i = 0; i < all.size(); i++) {
            if (all.get(i).getId().equals(id)) return i;
        }
        return -1;
    }

    private NoticeListResult.NoticeItem toNoticeItem(NoticeEntity n) {
        return NoticeListResult.NoticeItem.builder()
                .id(n.getId())
                .noticeType(n.getNoticeType())
                .title(n.getTitle())
                .content(n.getContent())
                .authorId(n.getAuthorId())
                .viewCount(n.getViewCount() != null ? n.getViewCount() : 0)
                .isPinned(Boolean.TRUE.equals(n.getIsPinned()))
                .pinnedAt(n.getPinnedAt())
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .build();
    }

    private NoticeDetailResult toDetailResult(NoticeEntity n) {
        return NoticeDetailResult.builder()
                .id(n.getId())
                .noticeType(n.getNoticeType())
                .title(n.getTitle())
                .content(n.getContent())
                .authorId(n.getAuthorId())
                .viewCount(n.getViewCount() != null ? n.getViewCount() : 0)
                .isPinned(Boolean.TRUE.equals(n.getIsPinned()))
                .pinnedAt(n.getPinnedAt())
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .build();
    }
}
