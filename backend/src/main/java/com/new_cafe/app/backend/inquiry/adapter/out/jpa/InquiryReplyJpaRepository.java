package com.new_cafe.app.backend.inquiry.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InquiryReplyJpaRepository extends JpaRepository<InquiryReplyEntity, Long> {
    List<InquiryReplyEntity> findByInquiryIdOrderByCreatedAtAsc(Long inquiryId);
    long countByInquiry_Id(Long inquiryId);
}
