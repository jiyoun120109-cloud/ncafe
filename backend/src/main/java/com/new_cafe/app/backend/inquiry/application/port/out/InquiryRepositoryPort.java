package com.new_cafe.app.backend.inquiry.application.port.out;

import com.new_cafe.app.backend.inquiry.model.Inquiry;

import java.util.List;
import java.util.Optional;

public interface InquiryRepositoryPort {

    List<Inquiry> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Inquiry> findById(Long id);

    List<Inquiry> findAllOrderByCreatedAtDesc();

    Inquiry save(Inquiry inquiry);

    void deleteById(Long id);
}
