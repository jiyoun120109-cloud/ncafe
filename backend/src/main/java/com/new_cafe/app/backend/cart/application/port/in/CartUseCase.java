package com.new_cafe.app.backend.cart.application.port.in;

/**
 * 장바구니 유스케이스 통합 인터페이스
 */
public interface CartUseCase extends GetCartUseCase, AddCartItemUseCase, UpdateCartItemUseCase, RemoveCartItemUseCase {
}
