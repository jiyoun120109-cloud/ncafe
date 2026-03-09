package com.new_cafe.app.backend.cart.application.command;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 장바구니 조회 커맨드
 * 비회원: guestSessionId 사용, 회원: userId 사용 (선택)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetCartCommand {
    private String guestSessionId;
    private Long userId;
}
