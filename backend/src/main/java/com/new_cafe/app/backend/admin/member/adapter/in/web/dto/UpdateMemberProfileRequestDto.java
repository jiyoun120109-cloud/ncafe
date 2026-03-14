package com.new_cafe.app.backend.admin.member.adapter.in.web.dto;

import lombok.Data;

@Data
public class UpdateMemberProfileRequestDto {
    private String email;
    private String phone;
}
