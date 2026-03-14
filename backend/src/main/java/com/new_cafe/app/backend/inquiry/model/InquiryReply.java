package com.new_cafe.app.backend.inquiry.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InquiryReply {
    private Long id;
    private Long inquiryId;
    private String content;
    private Long authorId;
    private Long parentReplyId;
    private LocalDateTime createdAt;
}
