package com.new_cafe.app.backend.inquiry.adapter.out.persistence;

import com.new_cafe.app.backend.inquiry.application.port.out.InquiryRepositoryPort;
import com.new_cafe.app.backend.inquiry.adapter.out.jpa.InquiryEntity;
import com.new_cafe.app.backend.inquiry.adapter.out.jpa.InquiryJpaRepository;
import com.new_cafe.app.backend.inquiry.model.Inquiry;
import org.springframework.stereotype.Component;

import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class InquiryPersistenceAdapter implements InquiryRepositoryPort {

    private final InquiryJpaRepository inquiryJpaRepository;

    public InquiryPersistenceAdapter(InquiryJpaRepository inquiryJpaRepository) {
        this.inquiryJpaRepository = inquiryJpaRepository;
    }

    @Override
    public List<Inquiry> findByUserIdOrderByCreatedAtDesc(Long userId) {
        return inquiryJpaRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Inquiry> findById(Long id) {
        return inquiryJpaRepository.findById(id).map(this::toModel);
    }

    @Override
    public List<Inquiry> findAllOrderByCreatedAtDesc() {
        return inquiryJpaRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::toModel)
                .collect(Collectors.toList());
    }

    @Override
    public Inquiry save(Inquiry inquiry) {
        InquiryEntity entity = toEntity(inquiry);
        InquiryEntity saved = inquiryJpaRepository.save(entity);
        return toModel(saved);
    }

    private Inquiry toModel(InquiryEntity e) {
        return Inquiry.builder()
                .id(e.getId())
                .userId(e.getUserId())
                .title(e.getTitle())
                .content(e.getContent())
                .isPrivate(e.getIsPrivate())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private InquiryEntity toEntity(Inquiry m) {
        return InquiryEntity.builder()
                .id(m.getId())
                .userId(m.getUserId())
                .title(m.getTitle())
                .content(m.getContent())
                .isPrivate(m.getIsPrivate() != null ? m.getIsPrivate() : false)
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
