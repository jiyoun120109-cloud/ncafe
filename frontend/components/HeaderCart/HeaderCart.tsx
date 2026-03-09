'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import styles from './HeaderCart.module.css';

type HeaderCartProps = {
    className?: string;
    scrolled?: boolean;
};

export default function HeaderCart({ className = '', scrolled = false }: HeaderCartProps) {
    const { totalQuantity } = useCart();

    return (
        <Link
            href="/cart"
            className={`${styles.link} ${className} ${scrolled ? styles.scrolled : ''}`}
            aria-label={`장바구니 ${totalQuantity > 0 ? `총 ${totalQuantity}개` : ''}`}
        >
            <span className={styles.iconWrap}>
                <ShoppingCart size={20} strokeWidth={1.8} />
                {totalQuantity > 0 && (
                    <span className={styles.badge} aria-hidden>
                        {totalQuantity > 99 ? '99+' : totalQuantity}
                    </span>
                )}
            </span>
        </Link>
    );
}
