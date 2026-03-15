'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
    fetchCart,
    addCartItem as addCartItemApi,
    updateCartItemQuantity as updateCartItemQuantityApi,
    updateCartItemOptions as updateCartItemOptionsApi,
    removeCartItem as removeCartItemApi,
    type CartItemDto,
    type CartResponse,
    type CartItemOptions,
} from '@/services/cartService';
import { useAuthStore } from '@/stores/authStore';

type CartContextValue = {
    items: CartItemDto[];
    totalQuantity: number;
    loading: boolean;
    addItem: (menuId: number, quantity?: number, options?: CartItemOptions) => Promise<void>;
    updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
    updateItemOptions: (cartItemId: number, options: CartItemOptions) => Promise<void>;
    removeItem: (cartItemId: number) => Promise<void>;
    clearAll: () => Promise<void>;
    refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItemDto[]>([]);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [loading, setLoading] = useState(true);
    const { user, isAuthenticated } = useAuthStore();

    const refresh = useCallback(async () => {
        try {
            const data: CartResponse = await fetchCart();
            const list = data.items ?? [];
            setItems([...list].sort((a, b) => a.id - b.id));
            setTotalQuantity(data.totalQuantity ?? 0);
        } catch {
            setItems([]);
            setTotalQuantity(0);
        } finally {
            setLoading(false);
        }
    }, []);

    // 초기 로드 + 로그인/로그아웃·다른 사용자 전환 시 장바구니 갱신 (백엔드가 JWT userId 기준으로 장바구니 반환)
    useEffect(() => {
        refresh();
    }, [refresh, user?.id, isAuthenticated]);

    const addItem = useCallback(async (menuId: number, quantity: number = 1, options?: CartItemOptions) => {
        await addCartItemApi(menuId, quantity, options);
        await refresh();
    }, [refresh]);

    const updateItemOptions = useCallback(async (cartItemId: number, options: CartItemOptions) => {
        await updateCartItemOptionsApi(cartItemId, options);
        await refresh();
    }, [refresh]);

    const updateQuantity = useCallback(async (cartItemId: number, quantity: number) => {
        await updateCartItemQuantityApi(cartItemId, quantity);
        await refresh();
    }, [refresh]);

    const removeItem = useCallback(async (cartItemId: number) => {
        await removeCartItemApi(cartItemId);
        await refresh();
    }, [refresh]);

    const clearAll = useCallback(async () => {
        try {
            const data = await fetchCart();
            const list = data.items ?? [];
            for (const item of list) {
                try {
                    await removeCartItemApi(item.id);
                } catch {
                    /* ignore per-item errors */
                }
            }
        } finally {
            await refresh();
        }
    }, [refresh]);

    const value: CartContextValue = {
        items,
        totalQuantity,
        loading,
        addItem,
        updateQuantity,
        updateItemOptions,
        removeItem,
        clearAll,
        refresh,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
