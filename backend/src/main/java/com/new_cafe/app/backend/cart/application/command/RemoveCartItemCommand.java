package com.new_cafe.app.backend.cart.application.command;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RemoveCartItemCommand {
    private String guestSessionId;
    private Long userId;
    private Long cartItemId;
}
