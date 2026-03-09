package com.new_cafe.app.backend.cart.application.port.in;

import com.new_cafe.app.backend.cart.application.command.AddCartItemCommand;

public interface AddCartItemUseCase {
    void addItem(AddCartItemCommand command);
}
