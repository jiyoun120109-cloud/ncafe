package com.new_cafe.app.backend.inquiry.adapter.out.persistence;

import com.new_cafe.app.backend.inquiry.application.port.out.InquiryReplyRepositoryPort;
import com.new_cafe.app.backend.inquiry.adapter.out.jpa.InquiryEntity;
import com.new_cafe.app.backend.inquiry.adapter.out.jpa.InquiryJpaRepository;
import com.new_cafe.app.backend.inquiry.adapter.out.jpa.InquiryReplyEntity;
import com.new_cafe.app.backend.inquiry.adapter.out.jpa.InquiryReplyJpaRepository;
import com.new_cafe.app.backend.inquiry.model.InquiryReply;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class InquiryReplyPersistenceAdapter implements InquiryReplyRepositoryPort {

    private final InquiryReplyJpaRepository inquiryReplyJpaRepository;
    private final InquiryJpaRepository inquiryJpaRepository;

    public InquiryReplyPersistenceAdapter(InquiryReplyJpaRepository inquiryReplyJpaRepository,
                                         InquiryJpaRepository inquiryJpaRepository) {
        this.inquiryReplyJpaRepository = inquiryReplyJpaRepository;
        this.inquiryJpaRepository = inquiryJpaRepository;
    }

    @Override
    public List<InquiryReply> findByInquiryIdOrderByCreatedAtAsc(Long inquiryId) {
        return inquiryReplyJpaRepository.findByInquiryIdOrderByCreatedAtAsc(inquiryId).stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    @Override
    public long countByInquiryId(Long inquiryId) {
        return inquiryReplyJpaRepository.countByInquiry_Id(inquiryId);
    }

    @Override
    public Optional<InquiryReply> findById(Long id) {
        return inquiryReplyJpaRepository.findById(id).map(this::toModel);
    }

    @Override
    public InquiryReply save(InquiryReply reply) {
        InquiryEntity inquiryEntity = inquiryJpaRepository.findById(reply.getInquiryId())
                .orElseThrow(() -> new IllegalArgumentException("문의를 찾을 수 없습니다."));
        InquiryReplyEntity entity = toEntity(reply, inquiryEntity);
        InquiryReplyEntity saved = inquiryReplyJpaRepository.save(entity);
        return toModel(saved);
    }

    @Override
    public void delete(InquiryReply reply) {
        InquiryReplyEntity entity = inquiryReplyJpaRepository.findById(reply.getId())
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));
        inquiryReplyJpaRepository.delete(entity);
    }

    private InquiryReply toModel(InquiryReplyEntity e) {
        return InquiryReply.builder()
                .id(e.getId())
                .inquiryId(e.getInquiry() != null ? e.getInquiry().getId() : null)
                .content(e.getContent())
                .authorId(e.getAuthorId())
                .parentReplyId(e.getParentReplyId())
                .createdAt(e.getCreatedAt())
                .build();
    }

    private InquiryReplyEntity toEntity(InquiryReply m, InquiryEntity inquiryEntity) {
        return InquiryReplyEntity.builder()
                .id(m.getId())
                .inquiry(inquiryEntity)
                .content(m.getContent())
                .authorId(m.getAuthorId())
                .parentReplyId(m.getParentReplyId())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
