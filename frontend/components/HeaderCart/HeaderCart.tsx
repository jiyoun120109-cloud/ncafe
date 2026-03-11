'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import styles from './HeaderCart.module.css';

type HeaderCartProps = {
    className?: string;
    scrolled?: boolean;
    /** true면 아이콘 대신 "장바구니" 텍스트로 표시 (모바일 드로어용) */
    textOnly?: boolean;
};

export default function HeaderCart({ className = '', scrolled = false, textOnly = false }: HeaderCartProps) {
    const { totalQuantity } = useCart();

    return (
        <Link
            href="/cart"
            className={`${styles.link} ${className} ${scrolled ? styles.scrolled : ''} ${textOnly ? styles.textOnly : ''}`}
            aria-label={`장바구니 ${totalQuantity > 0 ? `총 ${totalQuantity}개` : ''}`}
        >
            {textOnly ? (
                <span className={styles.textLabel}>
                    장바구니
                    {totalQuantity > 0 && (
                        <span className={styles.textCount} aria-hidden>
                            ({totalQuantity > 99 ? '99+' : totalQuantity})
                        </span>
                    )}
                </span>
            ) : (
                <span className={styles.iconWrap}>
                    <ShoppingCart size={20} strokeWidth={1.8} />
                    {totalQuantity > 0 && (
                        <span className={styles.badge} aria-hidden>
                            {totalQuantity > 99 ? '99+' : totalQuantity}
                        </span>
                    )}
                </span>
            )}
        </Link>
    );
}
