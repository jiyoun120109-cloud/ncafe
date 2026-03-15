'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Minus, Plus, Trash2, CreditCard } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import CheckoutLayout from '@/components/CheckoutLayout/CheckoutLayout';
import CartItemOptionModal from './_components/CartItemOptionModal';
import { menuImageUrl } from '@/utils/menuImageUrl';
import styles from './page.module.css';
import type { CartItemDto } from '@/services/cartService';

const LAST_MENUS_PATH_KEY = 'ncafe_last_menus_path';

export default function CartPage() {
    const { items, totalQuantity, loading, updateQuantity, updateItemOptions, removeItem } = useCart();
    const [clearing, setClearing] = useState(false);
    const [optionModalItem, setOptionModalItem] = useState<CartItemDto | null>(null);
    const [menusHref, setMenusHref] = useState('/menus');

    useEffect(() => {
        try {
            const saved = sessionStorage.getItem(LAST_MENUS_PATH_KEY);
            if (saved && saved.startsWith('/menus')) setMenusHref(saved);
        } catch (_) {}
    }, []);

    const totalPrice = items.reduce(
        (sum, it) => sum + (it.menuPrice + (it.optionExtraPrice ?? 0)) * it.quantity,
        0
    );

    const handleClearAll = async () => {
        if (items.length === 0) return;
        if (!confirm('장바구니를 비우시겠어요?')) return;
        setClearing(true);
        try {
            const ids = items.map((i) => i.id);
            for (const id of ids) {
                await removeItem(id);
            }
        } finally {
            setClearing(false);
        }
    };

    if (loading) {
        return (
            <CheckoutLayout currentStep="cart">
                <div className={styles.loading}>장바구니를 불러오는 중...</div>
            </CheckoutLayout>
        );
    }

    return (
        <CheckoutLayout currentStep="cart">
            {items.length === 0 ? (
                <div className={styles.empty}>
                    <ShoppingCart size={48} className={styles.emptyIcon} />
                    <p>장바구니가 비어 있습니다</p>
                    <p className={styles.emptySub}>원하는 메뉴를 담아보세요.</p>
                    <Link href={menusHref} className={styles.emptyCta}>
                        메뉴 보러 가기
                    </Link>
                </div>
            ) : (
                <div className={styles.content}>
                    <div className={styles.listHeader}>
                        <span className={styles.listTitle}>담은 메뉴</span>
                        <button
                            type="button"
                            className={styles.clearAllBtn}
                            onClick={handleClearAll}
                            disabled={clearing}
                        >
                            전체 비우기
                        </button>
                    </div>

                    <ul className={styles.list}>
                        {items.map((item) => {
                            const unitPrice = item.menuPrice + (item.optionExtraPrice ?? 0);
                            const lineTotal = unitPrice * item.quantity;
                            const soldOut = Boolean(item.isSoldOut);
                            const detailHref = `/menus/${item.menuId}`;
                            return (
                                <li
                                    key={item.id}
                                    className={`${styles.item} ${soldOut ? styles.itemSoldOut : ''}`}
                                >
                                    <Link
                                        href={detailHref}
                                        className={styles.itemThumb}
                                        aria-label={`${item.menuKorName} 상세 보기`}
                                    >
                                        {/* 이미지 URL: CartItemDto.menuImageUrl (cartService.ts) */}
                                        <Image
                                            src={menuImageUrl(item.menuImageUrl)}
                                            alt={item.menuKorName}
                                            width={72}
                                            height={72}
                                            className={styles.itemImage}
                                        />
                                    </Link>
                                    <div className={styles.itemBody}>
                                        <div className={styles.itemTop}>
                                            <Link
                                                href={detailHref}
                                                className={styles.itemName}
                                                aria-label={`${item.menuKorName} 상세 보기`}
                                            >
                                                {item.menuKorName}
                                            </Link>
                                            {soldOut && (
                                                <span className={styles.soldOutBadge}>품절</span>
                                            )}
                                            {!soldOut && (
                                                <button
                                                    type="button"
                                                    className={styles.removeBtn}
                                                    aria-label="삭제"
                                                    onClick={() => removeItem(item.id)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                        {item.optionsDisplay && (
                                            <p className={styles.itemOptions}>{item.optionsDisplay}</p>
                                        )}
                                        {!soldOut && (
                                            <button
                                                type="button"
                                                className={styles.optionChangeBtn}
                                                onClick={() => setOptionModalItem(item)}
                                            >
                                                옵션변경
                                            </button>
                                        )}
                                        <div className={styles.itemPriceRow}>
                                            <span className={styles.unitPrice}>
                                                {unitPrice.toLocaleString()}원
                                            </span>
                                            <div className={styles.quantity}>
                                                <button
                                                    type="button"
                                                    aria-label="수량 줄이기"
                                                    disabled={soldOut}
                                                    onClick={() =>
                                                        !soldOut &&
                                                        updateQuantity(item.id, Math.max(1, item.quantity - 1))
                                                    }
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    aria-label="수량 늘리기"
                                                    disabled={soldOut}
                                                    onClick={() =>
                                                        !soldOut &&
                                                        updateQuantity(item.id, item.quantity + 1)
                                                    }
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <span className={styles.itemSubtotal}>
                                                {lineTotal.toLocaleString()}원
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    <CartItemOptionModal
                        open={!!optionModalItem}
                        onClose={() => setOptionModalItem(null)}
                        item={optionModalItem}
                        onConfirm={async (cartItemId, options) => {
                            await updateItemOptions(cartItemId, options);
                        }}
                    />

                    <div className={styles.summary}>
                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>총 수량</span>
                            <span className={styles.summaryValue}>{totalQuantity}개</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>총 금액</span>
                            <span className={styles.totalPrice}>{totalPrice.toLocaleString()}원</span>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <Link href={menusHref} className={styles.continueLink}>
                            쇼핑 계속하기
                        </Link>
                        <Link href="/order" className={styles.orderBtn} aria-label="주문하기">
                            <CreditCard size={18} />
                            <span>주문하기</span>
                        </Link>
                    </div>
                </div>
            )}
        </CheckoutLayout>
    );
}
