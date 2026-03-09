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

type CartContextValue = {
    items: CartItemDto[];
    totalQuantity: number;
    loading: boolean;
    addItem: (menuId: number, quantity?: number, options?: CartItemOptions) => Promise<void>;
    updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
    updateItemOptions: (cartItemId: number, options: CartItemOptions) => Promise<void>;
    removeItem: (cartItemId: number) => Promise<void>;
    refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItemDto[]>([]);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        refresh();
    }, [refresh]);

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

    const value: CartContextValue = {
        items,
        totalQuantity,
        loading,
        addItem,
        updateQuantity,
        updateItemOptions,
        removeItem,
        refresh,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
