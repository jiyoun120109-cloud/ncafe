package com.new_cafe.app.backend.admin.member.adapter.in.web.dto;

import lombok.Data;

@Data
public class ResetPasswordRequestDto {
    private String newPassword;
    /** true이면 비밀번호 초기화 후 해당 회원에게 알림 전송 */
    private Boolean sendNotification;
}
