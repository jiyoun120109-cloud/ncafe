package com.new_cafe.app.backend.inquiry.adapter.out.jpa;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "inquiry_replies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InquiryReplyEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inquiry_id", nullable = false)
    private InquiryEntity inquiry;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "author_id")
    private Long authorId;

    @Column(name = "parent_reply_id")
    private Long parentReplyId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
