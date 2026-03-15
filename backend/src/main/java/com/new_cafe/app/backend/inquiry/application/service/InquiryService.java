package com.new_cafe.app.backend.inquiry.application.service;

import com.new_cafe.app.backend.inquiry.application.port.in.InquiryUseCase;
import com.new_cafe.app.backend.inquiry.application.port.out.CreateNotificationPort;
import com.new_cafe.app.backend.inquiry.application.port.out.InquiryReplyRepositoryPort;
import com.new_cafe.app.backend.inquiry.application.port.out.InquiryRepositoryPort;
import com.new_cafe.app.backend.inquiry.model.Inquiry;
import com.new_cafe.app.backend.inquiry.model.InquiryReply;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class InquiryService implements InquiryUseCase {

    private final InquiryRepositoryPort inquiryRepository;
    private final InquiryReplyRepositoryPort replyRepository;
    private final CreateNotificationPort createNotificationPort;

    public InquiryService(InquiryRepositoryPort inquiryRepository,
                          InquiryReplyRepositoryPort replyRepository,
                          CreateNotificationPort createNotificationPort) {
        this.inquiryRepository = inquiryRepository;
        this.replyRepository = replyRepository;
        this.createNotificationPort = createNotificationPort;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Inquiry> findByUserId(Long userId) {
        return inquiryRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Inquiry> listAll() {
        return inquiryRepository.findAllOrderByCreatedAtDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Inquiry> findById(Long id) {
        return inquiryRepository.findById(id);
    }

    @Override
    @Transactional
    public Inquiry create(Long userId, String inquiryType, String title, String content, boolean isPrivate, String attachmentUrl) {
        Inquiry inquiry = Inquiry.builder()
                .userId(userId)
                .inquiryType(inquiryType != null && !inquiryType.isBlank() ? inquiryType.trim() : null)
                .title(title)
                .content(content != null ? content : "")
                .isPrivate(isPrivate)
                .attachmentUrl(attachmentUrl != null && !attachmentUrl.isBlank() ? attachmentUrl.trim() : null)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return inquiryRepository.save(inquiry);
    }

    @Override
    @Transactional
    public Inquiry updateByUser(Long inquiryId, Long userId, String inquiryType, String title, String content, boolean isPrivate, String attachmentUrl) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new IllegalArgumentException("문의를 찾을 수 없습니다."));
        if (!userId.equals(inquiry.getUserId())) {
            throw new IllegalArgumentException("본인 문의만 수정할 수 있습니다.");
        }
        Inquiry updated = Inquiry.builder()
                .id(inquiry.getId())
                .userId(inquiry.getUserId())
                .inquiryType(inquiryType != null && !inquiryType.isBlank() ? inquiryType.trim() : null)
                .title(title != null && !title.isBlank() ? title.trim() : inquiry.getTitle())
                .content(content != null ? content : inquiry.getContent())
                .isPrivate(isPrivate)
                .attachmentUrl(attachmentUrl != null && !attachmentUrl.isBlank() ? attachmentUrl.trim() : inquiry.getAttachmentUrl())
                .createdAt(inquiry.getCreatedAt())
                .updatedAt(LocalDateTime.now())
                .build();
        return inquiryRepository.save(updated);
    }

    @Override
    @Transactional
    public InquiryReply addReply(Long inquiryId, String content, Long authorId) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new IllegalArgumentException("문의를 찾을 수 없습니다."));
        InquiryReply reply = InquiryReply.builder()
                .inquiryId(inquiry.getId())
                .content(content)
                .authorId(authorId)
                .parentReplyId(null)
                .createdAt(LocalDateTime.now())
                .build();
        reply = replyRepository.save(reply);
        String message = content != null && content.length() > 80 ? content.substring(0, 80) + "..." : content;
        createNotificationPort.create(inquiry.getUserId(), "INQUIRY_REPLY", inquiryId,
                "1:1 문의에 답변이 등록되었습니다.", message);
        return reply;
    }

    @Override
    @Transactional(readOnly = true)
    public List<InquiryReply> getReplies(Long inquiryId) {
        return replyRepository.findByInquiryIdOrderByCreatedAtAsc(inquiryId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countRepliesByInquiryId(Long inquiryId) {
        return replyRepository.countByInquiryId(inquiryId);
    }

    @Override
    @Transactional
    public InquiryReply addUserReply(Long inquiryId, Long userId, String content, Long parentReplyId) {
        if (parentReplyId == null) throw new IllegalArgumentException("parentReplyId가 필요합니다.");
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new IllegalArgumentException("문의를 찾을 수 없습니다."));
        if (!inquiry.getUserId().equals(userId)) throw new IllegalArgumentException("본인 문의에만 댓글을 달 수 있습니다.");
        InquiryReply parent = replyRepository.findById(parentReplyId)
                .orElseThrow(() -> new IllegalArgumentException("답변을 찾을 수 없습니다."));
        if (!parent.getInquiryId().equals(inquiryId) || parent.getParentReplyId() != null)
            throw new IllegalArgumentException("해당 답변에 댓글을 달 수 없습니다.");
        InquiryReply reply = InquiryReply.builder()
                .inquiryId(inquiryId)
                .content(content)
                .authorId(userId)
                .parentReplyId(parentReplyId)
                .createdAt(LocalDateTime.now())
                .build();
        return replyRepository.save(reply);
    }

    @Override
    @Transactional
    public InquiryReply updateUserReply(Long replyId, Long userId, String content) {
        InquiryReply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));
        if (reply.getParentReplyId() == null) throw new IllegalArgumentException("관리자 답변은 수정할 수 없습니다.");
        if (!userId.equals(reply.getAuthorId())) throw new IllegalArgumentException("본인 댓글만 수정할 수 있습니다.");
        InquiryReply updated = InquiryReply.builder()
                .id(reply.getId())
                .inquiryId(reply.getInquiryId())
                .content(content)
                .authorId(reply.getAuthorId())
                .parentReplyId(reply.getParentReplyId())
                .createdAt(reply.getCreatedAt())
                .build();
        return replyRepository.save(updated);
    }

    @Override
    @Transactional
    public void deleteUserReply(Long replyId, Long userId) {
        InquiryReply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));
        if (reply.getParentReplyId() == null) throw new IllegalArgumentException("관리자 답변은 삭제할 수 없습니다.");
        if (!userId.equals(reply.getAuthorId())) throw new IllegalArgumentException("본인 댓글만 삭제할 수 있습니다.");
        replyRepository.delete(reply);
    }

    @Override
    @Transactional
    public void deleteByUser(Long inquiryId, Long userId) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new IllegalArgumentException("문의를 찾을 수 없습니다."));
        if (!userId.equals(inquiry.getUserId())) {
            throw new IllegalArgumentException("본인 문의만 삭제할 수 있습니다.");
        }
        inquiryRepository.deleteById(inquiryId);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        if (inquiryRepository.findById(id).isEmpty()) {
            throw new IllegalArgumentException("문의를 찾을 수 없습니다.");
        }
        inquiryRepository.deleteById(id);
    }
}