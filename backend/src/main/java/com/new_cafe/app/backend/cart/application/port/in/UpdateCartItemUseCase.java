package com.new_cafe.app.backend.cart.application.port.in;

import com.new_cafe.app.backend.cart.application.command.UpdateCartItemCommand;

public interface UpdateCartItemUseCase {
    void updateQuantity(UpdateCartItemCommand command);
}
