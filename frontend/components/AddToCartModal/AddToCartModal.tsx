'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import styles from './AddToCartModal.module.css';

export interface AddToCartModalProps {
    open: boolean;
    onClose: () => void;
    /** 담은 메뉴 이름 (예: "아메리카노") */
    menuName?: string;
}

export default function AddToCartModal({
    open,
    onClose,
    menuName,
}: AddToCartModalProps) {
    const router = useRouter();
    const { totalQuantity } = useCart();

    useEffect(() => {
        if (!open) return;
        const onEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onEscape);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onEscape);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    const goToCart = () => {
        onClose();
        router.push('/cart');
    };

    if (!open) return null;

    const message = menuName
        ? `${menuName}을(를) 장바구니에 담았어요.`
        : '장바구니에 담았습니다.';

    return (
        <div
            className={styles.backdrop}
            onClick={(e) => e.target === e.currentTarget && onClose()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-to-cart-modal-title"
            aria-describedby="add-to-cart-modal-desc"
        >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.content}>
                    <div className={styles.iconWrap} aria-hidden>
                        <ShoppingCart size={28} strokeWidth={1.8} />
                    </div>
                    <h2 id="add-to-cart-modal-title" className={styles.title}>
                        장바구니에 담았어요
                    </h2>
                    <p id="add-to-cart-modal-desc" className={styles.message}>
                        {message}
                        {totalQuantity > 0 && (
                            <span className={styles.quantity}>
                                {' '}현재 장바구니에 <strong>{totalQuantity}개</strong>의 메뉴가 있어요.
                            </span>
                        )}
                    </p>
                </div>
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={onClose}
                    >
                        쇼핑 계속하기
                    </button>
                    <button
                        type="button"
                        className={styles.btnPrimary}
                        onClick={goToCart}
                    >
                        장바구니로 이동
                    </button>
                </div>
            </div>
        </div>
    );
}
