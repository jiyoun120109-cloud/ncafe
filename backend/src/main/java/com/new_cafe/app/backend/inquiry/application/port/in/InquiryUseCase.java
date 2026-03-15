package com.new_cafe.app.backend.inquiry.application.port.in;

import com.new_cafe.app.backend.inquiry.model.Inquiry;
import com.new_cafe.app.backend.inquiry.model.InquiryReply;

import java.util.List;
import java.util.Optional;

public interface InquiryUseCase {

    List<Inquiry> findByUserId(Long userId);

    List<Inquiry> listAll();

    Optional<Inquiry> findById(Long id);

    Inquiry create(Long userId, String inquiryType, String title, String content, boolean isPrivate, String attachmentUrl);

    Inquiry updateByUser(Long inquiryId, Long userId, String inquiryType, String title, String content, boolean isPrivate, String attachmentUrl);

    InquiryReply addReply(Long inquiryId, String content, Long authorId);

    List<InquiryReply> getReplies(Long inquiryId);

    long countRepliesByInquiryId(Long inquiryId);

    InquiryReply addUserReply(Long inquiryId, Long userId, String content, Long parentReplyId);

    InquiryReply updateUserReply(Long replyId, Long userId, String content);

    void deleteUserReply(Long replyId, Long userId);

    void deleteByUser(Long inquiryId, Long userId);

    /** 관리자: 문의 삭제 (답변 포함) */
    void deleteById(Long id);
}
