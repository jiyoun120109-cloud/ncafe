package com.new_cafe.app.backend.admin.member.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberDetailWithActivityResponseDto {
    private MemberDetailResponseDto member;
    private List<OrderSummaryDto> recentOrders;
    private List<InquirySummaryDto> recentInquiries;
    private List<LoginLogEntryDto> recentLoginLogs;
}
