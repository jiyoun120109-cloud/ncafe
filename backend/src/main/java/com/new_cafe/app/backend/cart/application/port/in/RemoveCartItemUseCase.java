package com.new_cafe.app.backend.cart.application.port.in;

import com.new_cafe.app.backend.cart.application.command.RemoveCartItemCommand;

public interface RemoveCartItemUseCase {
    void removeItem(RemoveCartItemCommand command);
}
