package com.new_cafe.app.backend.cart.application.port.in;

import com.new_cafe.app.backend.cart.application.command.GetCartCommand;
import com.new_cafe.app.backend.cart.application.result.GetCartResult;

public interface GetCartUseCase {
    GetCartResult getCart(GetCartCommand command);
}
