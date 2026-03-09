package com.new_cafe.app.backend.cart.application.service;

import com.new_cafe.app.backend.cart.application.command.*;
import com.new_cafe.app.backend.cart.application.port.in.CartUseCase;
import com.new_cafe.app.backend.cart.application.port.out.CartRepositoryPort;
import com.new_cafe.app.backend.cart.application.result.GetCartResult;
import com.new_cafe.app.backend.cart.domain.model.Cart;
import com.new_cafe.app.backend.cart.domain.model.CartItem;
import com.new_cafe.app.backend.menu.application.port.out.MenuImageRepositoryPort;
import com.new_cafe.app.backend.menu.application.port.out.MenuRepositoryPort;
import com.new_cafe.app.backend.menu.model.Menu;
import com.new_cafe.app.backend.menu.model.MenuImage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService implements CartUseCase {

    private static final int DECAF_EXTRA_PRICE = 300;

    private final CartRepositoryPort cartRepositoryPort;
    private final MenuRepositoryPort menuRepositoryPort;
    private final MenuImageRepositoryPort menuImageRepositoryPort;

    public CartService(CartRepositoryPort cartRepositoryPort, MenuRepositoryPort menuRepositoryPort,
                       MenuImageRepositoryPort menuImageRepositoryPort) {
        this.cartRepositoryPort = cartRepositoryPort;
        this.menuRepositoryPort = menuRepositoryPort;
        this.menuImageRepositoryPort = menuImageRepositoryPort;
    }

    @Override
    @Transactional(readOnly = true)
    public GetCartResult getCart(GetCartCommand command) {
        Cart cart = resolveCart(command.getGuestSessionId(), command.getUserId());
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            return GetCartResult.builder()
                .cartId(null)
                .items(List.of())
                .totalQuantity(0)
                .build();
        }
        List<GetCartResult.CartItemResult> items = cart.getItems().stream()
            .map(item -> {
                String imageUrl = getFirstMenuImageUrl(item.getMenuId());
                return GetCartResult.CartItemResult.builder()
                    .id(item.getId())
                    .menuId(item.getMenuId())
                    .menuKorName(item.getMenuKorName())
                    .menuPrice(item.getMenuPrice())
                    .quantity(item.getQuantity())
                    .optionsDisplay(item.getOptionsDisplay())
                    .optionExtraPrice(item.getOptionExtraPrice() != null ? item.getOptionExtraPrice() : 0)
                    .menuImageUrl(imageUrl)
                    .temperature(item.getOptionTemperature())
                    .beanOption(item.getOptionBean())
                    .decaf(item.getOptionDecaf())
                    .build();
            })
            .collect(Collectors.toList());
        return GetCartResult.builder()
            .cartId(cart.getId())
            .items(items)
            .totalQuantity(cart.getTotalQuantity())
            .build();
    }

    @Override
    @Transactional
    public void addItem(AddCartItemCommand command) {
        Menu menu = menuRepositoryPort.findById(command.getMenuId());
        if (menu == null) {
            throw new IllegalArgumentException("Menu not found: " + command.getMenuId());
        }
        String temperature = normalizeTemperature(command.getTemperature());
        String beanOption = command.getBeanOption() != null && !command.getBeanOption().isBlank()
            ? command.getBeanOption().trim() : null;
        boolean decaf = Boolean.TRUE.equals(command.getDecaf());
        int extraPrice = decaf ? DECAF_EXTRA_PRICE : 0;
        String optionsDisplay = buildOptionsDisplay(temperature, beanOption, decaf);

        Cart cart = findOrCreateCart(command.getGuestSessionId(), command.getUserId());
        CartItem existing = cart.getItems().stream()
            .filter(i -> command.getMenuId().equals(i.getMenuId()) && optionsMatch(i, temperature, beanOption, decaf))
            .findFirst()
            .orElse(null);
        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + command.getQuantity());
            cartRepositoryPort.updateCartItemQuantity(existing.getId(), existing.getQuantity());
        } else {
            CartItem newItem = CartItem.builder()
                .cartId(cart.getId())
                .menuId(menu.getId())
                .menuKorName(menu.getKorName())
                .menuPrice(menu.getPrice())
                .quantity(command.getQuantity())
                .optionTemperature(temperature)
                .optionBean(beanOption)
                .optionDecaf(decaf)
                .optionExtraPrice(extraPrice)
                .optionsDisplay(optionsDisplay)
                .build();
            cart.getItems().add(newItem);
            cart.setUpdatedAt(LocalDateTime.now());
            cartRepositoryPort.save(cart);
        }
    }

    @Override
    @Transactional
    public void updateQuantity(UpdateCartItemCommand command) {
        CartItem item = cartRepositoryPort.findCartItemById(command.getCartItemId());
        if (item == null) {
            throw new IllegalArgumentException("Cart item not found: " + command.getCartItemId());
        }
        if (command.getQuantity() != null && command.getQuantity() <= 0) {
            cartRepositoryPort.deleteCartItem(command.getCartItemId());
            return;
        }
        if (command.getQuantity() != null) {
            cartRepositoryPort.updateCartItemQuantity(command.getCartItemId(), command.getQuantity());
        }
        if (command.getTemperature() != null || command.getBeanOption() != null || command.getDecaf() != null) {
            String temperature = command.getTemperature() != null
                ? normalizeTemperature(command.getTemperature()) : (item.getOptionTemperature() != null ? item.getOptionTemperature() : "HOT");
            String beanOption = command.getBeanOption() != null ? command.getBeanOption().trim() : item.getOptionBean();
            boolean decaf = command.getDecaf() != null ? command.getDecaf() : Boolean.TRUE.equals(item.getOptionDecaf());
            int extraPrice = decaf ? DECAF_EXTRA_PRICE : 0;
            String optionsDisplay = buildOptionsDisplay(temperature, beanOption, decaf);
            cartRepositoryPort.updateCartItemOptions(command.getCartItemId(), temperature, beanOption, decaf, extraPrice, optionsDisplay);
        }
    }

    @Override
    @Transactional
    public void removeItem(RemoveCartItemCommand command) {
        CartItem item = cartRepositoryPort.findCartItemById(command.getCartItemId());
        if (item == null) {
            throw new IllegalArgumentException("Cart item not found: " + command.getCartItemId());
        }
        cartRepositoryPort.deleteCartItem(command.getCartItemId());
    }

    private Cart resolveCart(String guestSessionId, Long userId) {
        if (userId != null) {
            Cart byUser = cartRepositoryPort.findByUserId(userId);
            if (byUser != null) return byUser;
        }
        if (guestSessionId != null && !guestSessionId.isBlank()) {
            return cartRepositoryPort.findByGuestSessionId(guestSessionId);
        }
        return null;
    }

    private Cart findOrCreateCart(String guestSessionId, Long userId) {
        Cart cart = resolveCart(guestSessionId, userId);
        if (cart != null) return cart;
        if ((guestSessionId == null || guestSessionId.isBlank()) && userId == null) {
            throw new IllegalStateException("Cart requires either guestSessionId or userId");
        }
        cart = Cart.builder()
            .guestSessionId(guestSessionId != null && !guestSessionId.isBlank() ? guestSessionId : null)
            .userId(userId)
            .items(new ArrayList<>())
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        return cartRepositoryPort.save(cart);
    }

    private String getFirstMenuImageUrl(Long menuId) {
        if (menuId == null) return null;
        List<MenuImage> images = menuImageRepositoryPort.findAllByMenuId(menuId);
        return images.isEmpty() ? null : images.get(0).getImageSrc();
    }

    private static String normalizeTemperature(String temperature) {
        if (temperature == null || temperature.isBlank()) return "HOT";
        String t = temperature.trim().toUpperCase();
        return "ICED".equals(t) ? "ICED" : "HOT";
    }

    private static String buildOptionsDisplay(String temperature, String beanOption, boolean decaf) {
        List<String> parts = new ArrayList<>();
        if (temperature != null && !temperature.isBlank()) parts.add(temperature);
        if (beanOption != null && !beanOption.isBlank()) parts.add(beanOption);
        if (decaf) parts.add("디카페인");
        return parts.isEmpty() ? null : String.join(" | ", parts);
    }

    private static boolean optionsMatch(CartItem item, String temperature, String beanOption, boolean decaf) {
        String t = temperature != null ? temperature : "HOT";
        String b = beanOption != null && !beanOption.isBlank() ? beanOption : null;
        boolean sameTemp = t.equals(item.getOptionTemperature() != null ? item.getOptionTemperature() : "HOT");
        boolean sameBean = (b == null && (item.getOptionBean() == null || item.getOptionBean().isBlank()))
            || (b != null && b.equals(item.getOptionBean()));
        boolean sameDecaf = decaf == Boolean.TRUE.equals(item.getOptionDecaf());
        return sameTemp && sameBean && sameDecaf;
    }
}
