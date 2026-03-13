package com.new_cafe.app.backend.inquiry.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InquiryJpaRepository extends JpaRepository<InquiryEntity, Long> {
    List<InquiryEntity> findByUserIdOrderByCreatedAtDesc(Long userId);
}
