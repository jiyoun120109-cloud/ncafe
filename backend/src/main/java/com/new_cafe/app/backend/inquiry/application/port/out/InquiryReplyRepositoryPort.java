package com.new_cafe.app.backend.inquiry.application.port.out;

import com.new_cafe.app.backend.inquiry.model.InquiryReply;

import java.util.List;
import java.util.Optional;

public interface InquiryReplyRepositoryPort {

    List<InquiryReply> findByInquiryIdOrderByCreatedAtAsc(Long inquiryId);

    long countByInquiryId(Long inquiryId);

    Optional<InquiryReply> findById(Long id);

    InquiryReply save(InquiryReply reply);

    void delete(InquiryReply reply);
}
