package com.new_cafe.app.backend.cart.adapter.out.persistence;

import com.new_cafe.app.backend.cart.application.port.out.CartRepositoryPort;
import com.new_cafe.app.backend.cart.domain.model.Cart;
import com.new_cafe.app.backend.cart.domain.model.CartItem;
import com.new_cafe.app.backend.cart.adapter.out.jpa.CartEntity;
import com.new_cafe.app.backend.cart.adapter.out.jpa.CartItemEntity;
import com.new_cafe.app.backend.cart.adapter.out.jpa.CartJpaRepository;
import com.new_cafe.app.backend.cart.adapter.out.jpa.CartItemJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class CartPersistenceAdapter implements CartRepositoryPort {

    private final CartJpaRepository cartJpaRepository;
    private final CartItemJpaRepository cartItemJpaRepository;

    public CartPersistenceAdapter(CartJpaRepository cartJpaRepository,
                                  CartItemJpaRepository cartItemJpaRepository) {
        this.cartJpaRepository = cartJpaRepository;
        this.cartItemJpaRepository = cartItemJpaRepository;
    }

    @Override
    public Cart findByGuestSessionId(String guestSessionId) {
        if (guestSessionId == null || guestSessionId.isBlank()) return null;
        return cartJpaRepository.findByGuestSessionId(guestSessionId)
            .map(this::toDomain)
            .orElse(null);
    }

    @Override
    public Cart findByUserId(Long userId) {
        if (userId == null) return null;
        return cartJpaRepository.findByUserId(userId)
            .map(this::toDomain)
            .orElse(null);
    }

    @Override
    public Cart save(Cart cart) {
        CartEntity entity = cart.getId() != null
            ? cartJpaRepository.findById(cart.getId()).orElse(null)
            : null;
        if (entity == null) {
            entity = CartEntity.builder()
                .guestSessionId(cart.getGuestSessionId())
                .userId(cart.getUserId())
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .build();
        } else {
            entity.setUpdatedAt(cart.getUpdatedAt());
        }
        entity = cartJpaRepository.save(entity);
        cart.setId(entity.getId());

        if (cart.getItems() != null) {
            for (CartItem domainItem : cart.getItems()) {
                if (domainItem.getId() == null) {
                    CartItemEntity itemEntity = CartItemEntity.builder()
                        .cart(entity)
                        .menuId(domainItem.getMenuId())
                        .menuKorName(domainItem.getMenuKorName())
                        .menuPrice(domainItem.getMenuPrice())
                        .quantity(domainItem.getQuantity())
                        .optionTemperature(domainItem.getOptionTemperature())
                        .optionBean(domainItem.getOptionBean())
                        .optionDecaf(domainItem.getOptionDecaf())
                        .optionExtraPrice(domainItem.getOptionExtraPrice())
                        .optionsDisplay(domainItem.getOptionsDisplay())
                        .build();
                    itemEntity = cartItemJpaRepository.save(itemEntity);
                    domainItem.setId(itemEntity.getId());
                    domainItem.setCartId(entity.getId());
                }
            }
        }
        return cart;
    }

    @Override
    public CartItem findCartItemById(Long cartItemId) {
        return cartItemJpaRepository.findById(cartItemId)
            .map(this::toItemDomain)
            .orElse(null);
    }

    @Override
    public void updateCartItemQuantity(Long cartItemId, int quantity) {
        cartItemJpaRepository.findById(cartItemId).ifPresent(e -> {
            e.setQuantity(quantity);
            cartItemJpaRepository.save(e);
        });
    }

    @Override
    public void updateCartItemOptions(Long cartItemId, String optionTemperature, String optionBean,
                                     Boolean optionDecaf, Integer optionExtraPrice, String optionsDisplay) {
        cartItemJpaRepository.findById(cartItemId).ifPresent(e -> {
            if (optionTemperature != null) e.setOptionTemperature(optionTemperature);
            if (optionBean != null) e.setOptionBean(optionBean);
            if (optionDecaf != null) e.setOptionDecaf(optionDecaf);
            if (optionExtraPrice != null) e.setOptionExtraPrice(optionExtraPrice);
            if (optionsDisplay != null) e.setOptionsDisplay(optionsDisplay);
            cartItemJpaRepository.save(e);
        });
    }

    @Override
    public void deleteCartItem(Long cartItemId) {
        cartItemJpaRepository.deleteById(cartItemId);
    }

    private Cart toDomain(CartEntity e) {
        List<CartItem> items = e.getItems() == null ? Collections.emptyList()
            : e.getItems().stream()
                .map(this::toItemDomain)
                .collect(Collectors.toList());
        return Cart.builder()
            .id(e.getId())
            .guestSessionId(e.getGuestSessionId())
            .userId(e.getUserId())
            .items(items)
            .createdAt(e.getCreatedAt())
            .updatedAt(e.getUpdatedAt())
            .build();
    }

    private CartItem toItemDomain(CartItemEntity e) {
        return CartItem.builder()
            .id(e.getId())
            .cartId(e.getCart() != null ? e.getCart().getId() : null)
            .menuId(e.getMenuId())
            .menuKorName(e.getMenuKorName())
            .menuPrice(e.getMenuPrice())
            .quantity(e.getQuantity())
            .optionTemperature(e.getOptionTemperature())
            .optionBean(e.getOptionBean())
            .optionDecaf(e.getOptionDecaf())
            .optionExtraPrice(e.getOptionExtraPrice() != null ? e.getOptionExtraPrice() : 0)
            .optionsDisplay(e.getOptionsDisplay())
            .build();
    }
}
