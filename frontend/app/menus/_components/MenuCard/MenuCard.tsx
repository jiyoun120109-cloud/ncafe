'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowRight, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import AddToCartModal from '@/components/AddToCartModal';
import styles from './MenuCard.module.css';

function isValidImageUrl(url: string | null | undefined): boolean {
    if (!url?.trim()) return false;
    if (url.startsWith('http')) {
        try {
            const path = new URL(url).pathname;
            return /\.(png|jpe?g|gif|webp|svg|ico)(\?|$)/i.test(path);
        } catch {
            return false;
        }
    }
    return true;
}

function imageSrc(url: string | null | undefined): string {
    if (!url?.trim()) return '/images/missing';
    if (url.startsWith('http')) {
        try {
            const path = new URL(url).pathname;
            const hasImageExt = /\.(png|jpe?g|gif|webp|svg|ico)(\?|$)/i.test(path);
            if (!hasImageExt) return '/images/missing';
        } catch {
            return '/images/missing';
        }
        return url;
    }
    const filename = url.replace(/^.*\//, '').trim();
    return `/images/${filename || 'missing'}`;
}
import type { UserMenuResponse } from '../useUserMenus';

interface MenuCardProps {
    menu: UserMenuResponse;
}

const MIN_QTY = 1;
const MAX_QTY = 99;

export default function MenuCard({ menu }: MenuCardProps) {
    const router = useRouter();
    const { addItem } = useCart();
    const [imgError, setImgError] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [cartModalOpen, setCartModalOpen] = useState(false);
    const [cartModalMenuName, setCartModalMenuName] = useState<string | undefined>();

    const handleCardClick = () => {
        router.push(`/menus/${menu.id}`);
    };

    const handleQtyChange = (e: React.MouseEvent, delta: number) => {
        e.stopPropagation();
        setQuantity((q) => Math.min(MAX_QTY, Math.max(MIN_QTY, q + delta)));
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!menu.isAvailable) return;
        addItem(menu.id, quantity)
            .then(() => {
                setCartModalMenuName(menu.korName);
                setCartModalOpen(true);
            })
            .catch(() => {});
    };

    const showPlaceholder = !menu.imageSrc || imgError || !isValidImageUrl(menu.imageSrc);
    const imageSrcUrl = imageSrc(menu.imageSrc);

    return (
        <article
            className={styles.card}
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
        >
            {/* 이미지 */}
            <div className={styles.imageContainer}>
                {!showPlaceholder ? (
                    <Image
                        src={imageSrcUrl}
                        alt={menu.korName}
                        fill
                        className={styles.image}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <AlertTriangle className={styles.placeholderIcon} />
                        <span>이미지 없음</span>
                    </div>
                )}
                {!menu.isAvailable && (
                    <div className={styles.soldOutOverlay}>
                        <span className={styles.soldOutBadge}>품절</span>
                    </div>
                )}
            </div>

            {/* 컨텐츠 */}
            <div className={styles.content}>
                <span className={styles.category}>{menu.categoryName}</span>
                <h3 className={styles.korName}>{menu.korName}</h3>
                <p className={styles.description}>{menu.description}</p>

                <div className={styles.footer}>
                    <span className={styles.price}>{menu.price.toLocaleString()}원</span>
                    <div className={styles.footerActions}>
                        <div className={styles.quantityWrap} onClick={(e) => e.stopPropagation()}>
                            <button
                                type="button"
                                className={styles.qtyBtn}
                                aria-label="수량 줄이기"
                                onClick={(e) => handleQtyChange(e, -1)}
                                disabled={!menu.isAvailable || quantity <= MIN_QTY}
                            >
                                <Minus size={12} />
                            </button>
                            <span className={styles.qtyValue}>{quantity}</span>
                            <button
                                type="button"
                                className={styles.qtyBtn}
                                aria-label="수량 늘리기"
                                onClick={(e) => handleQtyChange(e, 1)}
                                disabled={!menu.isAvailable || quantity >= MAX_QTY}
                            >
                                <Plus size={12} />
                            </button>
                        </div>
                        <button
                            type="button"
                            className={styles.cartBtn}
                            aria-label={`${menu.korName} 장바구니에 담기`}
                            onClick={handleAddToCart}
                            disabled={!menu.isAvailable}
                            title="장바구니에 담기"
                        >
                            <ShoppingCart size={16} />
                        </button>
                        <button
                            className={styles.arrowBtn}
                            aria-label={`${menu.korName} 상세보기`}
                            onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
                        >
                            <ArrowRight size={15} />
                        </button>
                    </div>
                </div>
            </div>

            <AddToCartModal
                open={cartModalOpen}
                onClose={() => setCartModalOpen(false)}
                menuName={cartModalMenuName}
            />
        </article>
    );
}
