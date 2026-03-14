package com.new_cafe.app.backend.payment.application.port.in;

import java.util.Map;

public interface ProcessPaymentUseCase {

    Map<String, Object> ready(Long orderId, String method);

    void complete(Long orderId, String pgTid);
}
