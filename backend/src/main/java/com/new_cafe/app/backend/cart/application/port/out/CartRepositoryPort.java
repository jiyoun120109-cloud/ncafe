package com.new_cafe.app.backend.cart.application.port.out;

import com.new_cafe.app.backend.cart.domain.model.Cart;
import com.new_cafe.app.backend.cart.domain.model.CartItem;

public interface CartRepositoryPort {
    Cart findByGuestSessionId(String guestSessionId);
    Cart findByUserId(Long userId);
    Cart save(Cart cart);
    CartItem findCartItemById(Long cartItemId);
    void updateCartItemQuantity(Long cartItemId, int quantity);
    void updateCartItemOptions(Long cartItemId, String optionTemperature, String optionBean,
                              Boolean optionDecaf, Integer optionExtraPrice, String optionsDisplay);
    void deleteCartItem(Long cartItemId);
}
