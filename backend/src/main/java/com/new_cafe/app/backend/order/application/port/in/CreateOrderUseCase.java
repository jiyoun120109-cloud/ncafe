package com.new_cafe.app.backend.order.application.port.in;

import com.new_cafe.app.backend.order.application.command.CreateOrderCommand;
import com.new_cafe.app.backend.order.application.result.CreateOrderResult;

public interface CreateOrderUseCase {
    CreateOrderResult createOrder(CreateOrderCommand command);
}
