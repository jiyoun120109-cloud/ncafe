package com.new_cafe.app.backend.inquiry.application.service;

import com.new_cafe.app.backend.inquiry.adapter.out.jpa.InquiryEntity;
import com.new_cafe.app.backend.inquiry.adapter.out.jpa.InquiryJpaRepository;
import com.new_cafe.app.backend.inquiry.adapter.out.jpa.InquiryReplyEntity;
import com.new_cafe.app.backend.inquiry.adapter.out.jpa.InquiryReplyJpaRepository;
import com.new_cafe.app.backend.notification.adapter.out.jpa.NotificationEntity;
import com.new_cafe.app.backend.notification.adapter.out.jpa.NotificationJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class InquiryService {

    private final InquiryJpaRepository inquiryJpaRepository;
    private final InquiryReplyJpaRepository inquiryReplyJpaRepository;
    private final NotificationJpaRepository notificationJpaRepository;

    public InquiryService(InquiryJpaRepository inquiryJpaRepository,
                          InquiryReplyJpaRepository inquiryReplyJpaRepository,
                          NotificationJpaRepository notificationJpaRepository) {
        this.inquiryJpaRepository = inquiryJpaRepository;
        this.inquiryReplyJpaRepository = inquiryReplyJpaRepository;
        this.notificationJpaRepository = notificationJpaRepository;
    }

    @Transactional(readOnly = true)
    public List<InquiryEntity> findByUserId(Long userId) {
        return inquiryJpaRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public Optional<InquiryEntity> findById(Long id) {
        return inquiryJpaRepository.findById(id);
    }

    @Transactional
    public InquiryEntity create(Long userId, String title, String content, boolean isPrivate) {
        InquiryEntity e = InquiryEntity.builder()
                .userId(userId)
                .title(title)
                .content(content != null ? content : "")
                .isPrivate(isPrivate)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return inquiryJpaRepository.save(e);
    }

    @Transactional
    public InquiryReplyEntity addReply(Long inquiryId, String content, Long authorId) {
        InquiryEntity inquiry = inquiryJpaRepository.findById(inquiryId).orElseThrow(() -> new IllegalArgumentException("문의를 찾을 수 없습니다."));
        InquiryReplyEntity reply = InquiryReplyEntity.builder()
                .inquiry(inquiry)
                .content(content)
                .authorId(authorId)
                .parentReplyId(null)
                .createdAt(LocalDateTime.now())
                .build();
        reply = inquiryReplyJpaRepository.save(reply);
        NotificationEntity n = NotificationEntity.builder()
                .userId(inquiry.getUserId())
                .type("INQUIRY_REPLY")
                .refId(inquiryId)
                .title("1:1 문의에 답변이 등록되었습니다.")
                .message(content != null && content.length() > 80 ? content.substring(0, 80) + "..." : content)
                .createdAt(LocalDateTime.now())
                .build();
        notificationJpaRepository.save(n);
        return reply;
    }

    @Transactional(readOnly = true)
    public List<InquiryReplyEntity> getReplies(Long inquiryId) {
        return inquiryReplyJpaRepository.findByInquiryIdOrderByCreatedAtAsc(inquiryId);
    }

    /** 사용자 대댓글 추가 (관리자 답변에 대한 댓글) */
    @Transactional
    public InquiryReplyEntity addUserReply(Long inquiryId, Long userId, String content, Long parentReplyId) {
        if (parentReplyId == null) throw new IllegalArgumentException("parentReplyId가 필요합니다.");
        InquiryEntity inquiry = inquiryJpaRepository.findById(inquiryId).orElseThrow(() -> new IllegalArgumentException("문의를 찾을 수 없습니다."));
        if (!inquiry.getUserId().equals(userId)) throw new IllegalArgumentException("본인 문의에만 댓글을 달 수 있습니다.");
        InquiryReplyEntity parent = inquiryReplyJpaRepository.findById(parentReplyId).orElseThrow(() -> new IllegalArgumentException("답변을 찾을 수 없습니다."));
        if (!parent.getInquiry().getId().equals(inquiryId) || parent.getParentReplyId() != null)
            throw new IllegalArgumentException("해당 답변에 댓글을 달 수 없습니다.");
        InquiryReplyEntity reply = InquiryReplyEntity.builder()
                .inquiry(inquiry)
                .content(content)
                .authorId(userId)
                .parentReplyId(parentReplyId)
                .createdAt(LocalDateTime.now())
                .build();
        return inquiryReplyJpaRepository.save(reply);
    }

    /** 사용자 대댓글 수정 (본인 댓글만, 관리자 답변 제외) */
    @Transactional
    public InquiryReplyEntity updateUserReply(Long replyId, Long userId, String content) {
        InquiryReplyEntity reply = inquiryReplyJpaRepository.findById(replyId).orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));
        if (reply.getParentReplyId() == null) throw new IllegalArgumentException("관리자 답변은 수정할 수 없습니다.");
        if (!userId.equals(reply.getAuthorId())) throw new IllegalArgumentException("본인 댓글만 수정할 수 있습니다.");
        reply.setContent(content);
        return inquiryReplyJpaRepository.save(reply);
    }

    /** 사용자 대댓글 삭제 (본인 댓글만) */
    @Transactional
    public void deleteUserReply(Long replyId, Long userId) {
        InquiryReplyEntity reply = inquiryReplyJpaRepository.findById(replyId).orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));
        if (reply.getParentReplyId() == null) throw new IllegalArgumentException("관리자 답변은 삭제할 수 없습니다.");
        if (!userId.equals(reply.getAuthorId())) throw new IllegalArgumentException("본인 댓글만 삭제할 수 있습니다.");
        inquiryReplyJpaRepository.delete(reply);
    }
}
