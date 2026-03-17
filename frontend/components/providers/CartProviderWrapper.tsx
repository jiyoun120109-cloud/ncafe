'use client';

import { CartProvider } from '@/contexts/CartContext';
import AuthProvider from './AuthProvider';

export default function CartProviderWrapper({ children }: { children: React.ReactNode }) {
    return (
        <CartProvider>
            <AuthProvider>
                {children}
            </AuthProvider>
        </CartProvider>
    );
}
