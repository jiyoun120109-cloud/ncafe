package com.new_cafe.app.backend.inquiry.application.port.in;

import com.new_cafe.app.backend.inquiry.model.Inquiry;
import com.new_cafe.app.backend.inquiry.model.InquiryReply;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface InquiryUseCase {

    List<Inquiry> findByUserId(Long userId);

    List<Inquiry> listAll();

    /** 관리자 목록: 검색·항목·기간 필터 (hasReply 필터는 컨트롤러에서 처리) */
    List<Inquiry> listForAdmin(String search, String inquiryType, LocalDate fromDate, LocalDate toDate);

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

    /** 관리자: 선택 문의 일괄 삭제 */
    void deleteByIds(List<Long> ids);
}
