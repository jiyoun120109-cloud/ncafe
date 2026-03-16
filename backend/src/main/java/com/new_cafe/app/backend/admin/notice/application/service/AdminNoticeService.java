package com.new_cafe.app.backend.admin.notice.application.service;

import com.new_cafe.app.backend.admin.notice.application.command.*;
import com.new_cafe.app.backend.admin.notice.application.port.in.AdminNoticeUseCase;
import com.new_cafe.app.backend.admin.notice.application.port.out.AdminNoticeRepositoryPort;
import com.new_cafe.app.backend.admin.notice.application.port.out.CreateNotificationPort;
import com.new_cafe.app.backend.admin.notice.application.result.NoticeDetailResult;
import com.new_cafe.app.backend.admin.notice.application.result.NoticeListResult;
import com.new_cafe.app.backend.auth.application.port.out.GetMemberIdsByRolePort;
import com.new_cafe.app.backend.notice.model.Notice;
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

    private final AdminNoticeRepositoryPort adminNoticeRepository;
    private final GetMemberIdsByRolePort getMemberIdsByRolePort;
    private final CreateNotificationPort createNotificationPort;

    public AdminNoticeService(AdminNoticeRepositoryPort adminNoticeRepository,
                              GetMemberIdsByRolePort getMemberIdsByRolePort,
                              CreateNotificationPort createNotificationPort) {
        this.adminNoticeRepository = adminNoticeRepository;
        this.getMemberIdsByRolePort = getMemberIdsByRolePort;
        this.createNotificationPort = createNotificationPort;
    }

    @Override
    @Transactional(readOnly = true)
    public NoticeListResult getNoticeList(NoticeListCommand command) {
        PageRequest pageable = PageRequest.of(command.getPage(), command.getSize());
        Page<Notice> paged = findPaged(pageable, command);
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
        Optional<Notice> opt = command.isIncrementView()
                ? findByIdAndIncrementViewCount(command.getId())
                : adminNoticeRepository.findById(command.getId());
        return opt.map(this::toDetailResult);
    }

    @Override
    @Transactional
    public NoticeDetailResult createNotice(CreateNoticeCommand command) {
        LocalDateTime now = LocalDateTime.now();
        Notice notice = Notice.builder()
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
        notice = adminNoticeRepository.save(notice);
        List<Long> userIds = getMemberIdsByRolePort.findUserIdsByRole("USER");
        String msg = notice.getContent();
        String message = msg != null && msg.length() > 100 ? msg.substring(0, 100) + "..." : msg;
        for (Long userId : userIds) {
            createNotificationPort.create(userId, "NOTICE", notice.getId(),
                    "새 공지: " + notice.getTitle(), message);
        }
        return toDetailResult(notice);
    }

    @Override
    @Transactional
    public Optional<NoticeDetailResult> updateNotice(UpdateNoticeCommand command) {
        return adminNoticeRepository.findById(command.getId()).map(n -> {
            Notice updated = Notice.builder()
                    .id(n.getId())
                    .noticeType(command.getNoticeType() != null ? command.getNoticeType() : n.getNoticeType())
                    .title(command.getTitle() != null ? command.getTitle() : n.getTitle())
                    .content(command.getContent() != null ? command.getContent() : n.getContent())
                    .authorId(n.getAuthorId())
                    .viewCount(n.getViewCount())
                    .isPinned(command.getIsPinned() != null ? command.getIsPinned() : n.getIsPinned())
                    .pinnedAt(n.getPinnedAt())
                    .createdAt(n.getCreatedAt())
                    .updatedAt(LocalDateTime.now())
                    .build();
            if (Boolean.TRUE.equals(command.getIsPinned()) && !Boolean.TRUE.equals(n.getIsPinned())) {
                updated.setPinnedAt(LocalDateTime.now());
            } else if (!Boolean.TRUE.equals(command.getIsPinned())) {
                updated.setPinnedAt(null);
            }
            return adminNoticeRepository.save(updated);
        }).map(this::toDetailResult);
    }

    @Override
    @Transactional
    public Optional<NoticeDetailResult> togglePin(Long id) {
        return adminNoticeRepository.findById(id).map(n -> {
            Notice toggled = Notice.builder()
                    .id(n.getId())
                    .noticeType(n.getNoticeType())
                    .title(n.getTitle())
                    .content(n.getContent())
                    .authorId(n.getAuthorId())
                    .viewCount(n.getViewCount())
                    .isPinned(!Boolean.TRUE.equals(n.getIsPinned()))
                    .pinnedAt(!Boolean.TRUE.equals(n.getIsPinned()) ? LocalDateTime.now() : null)
                    .createdAt(n.getCreatedAt())
                    .updatedAt(LocalDateTime.now())
                    .build();
            return adminNoticeRepository.save(toggled);
        }).map(this::toDetailResult);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<NoticeDetailResult> getPrev(Long currentId) {
        List<Notice> all = adminNoticeRepository.findAllOrderByPinnedAndCreatedAt();
        int idx = indexOf(all, currentId);
        if (idx <= 0) return Optional.empty();
        return Optional.of(toDetailResult(all.get(idx - 1)));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<NoticeDetailResult> getNext(Long currentId) {
        List<Notice> all = adminNoticeRepository.findAllOrderByPinnedAndCreatedAt();
        int idx = indexOf(all, currentId);
        if (idx < 0 || idx >= all.size() - 1) return Optional.empty();
        return Optional.of(toDetailResult(all.get(idx + 1)));
    }

    @Override
    @Transactional
    public void deleteNotice(Long id) {
        adminNoticeRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteNotices(List<Long> ids) {
        if (ids != null && !ids.isEmpty()) {
            adminNoticeRepository.deleteAllById(ids);
        }
    }

    private Page<Notice> findPaged(PageRequest pageable, NoticeListCommand command) {
        String search = command.getSearch();
        String noticeType = command.getNoticeType();
        java.time.LocalDate fromDate = command.getFromDate();
        java.time.LocalDate toDate = command.getToDate();
        boolean hasFilter = (search != null && !search.isBlank())
                || (noticeType != null && !noticeType.isBlank())
                || fromDate != null
                || toDate != null;
        if (hasFilter) {
            return adminNoticeRepository.findWithFilters(search, noticeType, fromDate, toDate, pageable);
        }
        return adminNoticeRepository.findAllOrderByPinnedAndCreatedAt(pageable);
    }

    private Optional<Notice> findByIdAndIncrementViewCount(Long id) {
        Optional<Notice> opt = adminNoticeRepository.findById(id);
        opt.ifPresent(n -> {
            n.setViewCount(n.getViewCount() != null ? n.getViewCount() + 1 : 1);
            adminNoticeRepository.save(n);
        });
        return opt;
    }

    private int indexOf(List<Notice> all, Long id) {
        for (int i = 0; i < all.size(); i++) {
            if (all.get(i).getId().equals(id)) return i;
        }
        return -1;
    }

    private NoticeListResult.NoticeItem toNoticeItem(Notice n) {
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

    private NoticeDetailResult toDetailResult(Notice n) {
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
