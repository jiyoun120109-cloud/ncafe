'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, ShoppingCart, CreditCard } from 'lucide-react';
import AddToCartModal from '@/components/AddToCartModal';
import styles from './MenuDetailInfo.module.css';
import { useUserMenuDetail } from '../useUserMenuDetail';
import type { CartItemOptions } from '@/services/cartService';
import type { ProductInfo } from '@/types/menu';

const MIN_QTY = 1;
const MAX_QTY = 99;
const DECAF_EXTRA = 300;

const BEAN_OPTIONS = [
    { value: '', label: '기본 원두' },
    { value: '에티오피아', label: '에티오피아' },
    { value: '콜롬비아', label: '콜롬비아' },
    { value: '케냐', label: '케냐' },
    { value: '브라질', label: '브라질' },
];

interface MenuDetailInfoProps {
    id: string;
}

export default function MenuDetailInfo({ id }: MenuDetailInfoProps) {
    const { menu, loading, error } = useUserMenuDetail(id);
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [cartModalOpen, setCartModalOpen] = useState(false);
    const [temperature, setTemperature] = useState<'HOT' | 'ICED'>('HOT');
    const [beanOption, setBeanOption] = useState('');
    const [decaf, setDecaf] = useState(false);

    const isCoffee = menu?.categoryName === '커피';
    const optionsPrice = isCoffee && decaf ? DECAF_EXTRA : 0;
    const totalUnitPrice = (menu?.price ?? 0) + optionsPrice;

    const productInfo = useMemo((): ProductInfo | null => {
        if (!menu?.productInfoJson?.trim()) return null;
        try {
            return JSON.parse(menu.productInfoJson) as ProductInfo;
        } catch {
            return null;
        }
    }, [menu?.productInfoJson]);

    const handleAddToCart = () => {
        if (!menu?.isAvailable) return;
        const options: CartItemOptions = isCoffee
            ? { temperature, beanOption: beanOption || undefined, decaf }
            : {};
        addItem(menu.id, quantity, options)
            .then(() => setCartModalOpen(true))
            .catch(() => {});
    };

    if (loading) {
        return (
            <section className={styles.infoSection}>
                <div className={styles.infoCard}>
                    <p className={styles.loading}>메뉴 정보를 불러오는 중...</p>
                </div>
            </section>
        );
    }

    if (error || !menu) {
        return (
            <section className={styles.infoSection}>
                <div className={styles.infoCard}>
                    <p className={styles.error}>{error ?? '메뉴를 찾을 수 없습니다.'}</p>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.infoSection}>
            <div className={styles.infoCard}>
                <span className={styles.categoryBadge}>{menu.categoryName}</span>
                <h1 className={styles.korName}>{menu.korName}</h1>
                <p className={styles.engName}>{menu.engName}</p>
                <p className={styles.price}>
                    {menu.price.toLocaleString()}원
                    {isCoffee && optionsPrice > 0 && (
                        <span className={styles.optionExtra}> + 옵션 {optionsPrice.toLocaleString()}원</span>
                    )}
                </p>
                <p className={styles.description}>{menu.description}</p>

                {isCoffee && (
                    <>
                        <div className={styles.optionSection}>
                            <p className={styles.optionLabel}>온도</p>
                            <div className={styles.temperatureRow}>
                                <button
                                    type="button"
                                    className={temperature === 'HOT' ? styles.tempBtnActive : styles.tempBtn}
                                    onClick={() => setTemperature('HOT')}
                                    disabled={!menu.isAvailable}
                                >
                                    HOT
                                </button>
                                <button
                                    type="button"
                                    className={temperature === 'ICED' ? styles.tempBtnActive : styles.tempBtn}
                                    onClick={() => setTemperature('ICED')}
                                    disabled={!menu.isAvailable}
                                >
                                    ICED
                                </button>
                            </div>
                        </div>

                        <div className={styles.optionSection}>
                            <p className={styles.optionLabel}>원두 선택</p>
                            <select
                                className={styles.beanSelect}
                                value={beanOption}
                                onChange={(e) => setBeanOption(e.target.value)}
                                disabled={!menu.isAvailable}
                            >
                                {BEAN_OPTIONS.map((opt) => (
                                    <option key={opt.value || 'default'} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.optionSection}>
                            <label className={styles.decafLabel}>
                                <input
                                    type="checkbox"
                                    checked={decaf}
                                    onChange={(e) => setDecaf(e.target.checked)}
                                    disabled={!menu.isAvailable}
                                    className={styles.decafCheckbox}
                                />
                                <span>디카페인 (+{DECAF_EXTRA.toLocaleString()}원)</span>
                            </label>
                        </div>
                    </>
                )}

                {productInfo && (
                    <div className={styles.productNotice}>
                        <h3 className={styles.productNoticeTitle}>상품 정보 제공 고시</h3>
                        {(productInfo.weightG != null || productInfo.calorieKcal != null) && (
                            <p className={styles.productNoticeMeta}>
                                {productInfo.weightG != null && `${productInfo.weightG}g`}
                                {productInfo.weightG != null && productInfo.calorieKcal != null && ' · '}
                                {productInfo.calorieKcal != null && `${productInfo.calorieKcal}kcal`}
                            </p>
                        )}
                        {productInfo.nutrition && Object.keys(productInfo.nutrition).length > 0 && (
                            <div className={styles.nutritionGrid}>
                                {productInfo.nutrition.sodiumMg != null && (
                                    <span className={styles.nutItem}>나트륨 {productInfo.nutrition.sodiumMg}mg</span>
                                )}
                                {productInfo.nutrition.carbsG != null && (
                                    <span className={styles.nutItem}>탄수화물 {productInfo.nutrition.carbsG}g</span>
                                )}
                                {productInfo.nutrition.sugarsG != null && (
                                    <span className={styles.nutItem}>당류 {productInfo.nutrition.sugarsG}g</span>
                                )}
                                {productInfo.nutrition.fatG != null && (
                                    <span className={styles.nutItem}>지방 {productInfo.nutrition.fatG}g</span>
                                )}
                                {productInfo.nutrition.proteinG != null && (
                                    <span className={styles.nutItem}>단백질 {productInfo.nutrition.proteinG}g</span>
                                )}
                            </div>
                        )}
                        {productInfo.allergens && productInfo.allergens.length > 0 && (
                            <p className={styles.allergenLine}>
                                알레르기 유발 물질: {productInfo.allergens.join(', ')}
                            </p>
                        )}
                        {productInfo.storage && (
                            <p className={styles.storageLine}>보관방법: {productInfo.storage}</p>
                        )}
                    </div>
                )}

                <div className={styles.statusRow}>
                    <span className={menu.isAvailable ? styles.statusAvailable : styles.statusSoldOut}>
                        {menu.isAvailable ? '판매중' : '품절'}
                    </span>
                </div>

                <div className={styles.quantityRow}>
                    <span className={styles.quantityLabel}>수량</span>
                    <div className={styles.quantityControls}>
                        <button
                            type="button"
                            className={styles.quantityBtn}
                            aria-label="수량 줄이기"
                            onClick={() => setQuantity((q) => Math.max(MIN_QTY, q - 1))}
                            disabled={!menu.isAvailable || quantity <= MIN_QTY}
                        >
                            <Minus size={18} />
                        </button>
                        <span className={styles.quantityValue}>{quantity}</span>
                        <button
                            type="button"
                            className={styles.quantityBtn}
                            aria-label="수량 늘리기"
                            onClick={() => setQuantity((q) => Math.min(MAX_QTY, q + 1))}
                            disabled={!menu.isAvailable || quantity >= MAX_QTY}
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>

                <div className={styles.actionRow}>
                    <button
                        type="button"
                        className={styles.cartButton}
                        onClick={handleAddToCart}
                        disabled={!menu.isAvailable}
                    >
                        <ShoppingCart size={18} />
                        <span>장바구니에 담기</span>
                    </button>
                    {menu.isAvailable ? (
                        <Link
                            href="/order"
                            className={styles.orderButton}
                            aria-label="주문하기"
                        >
                            <CreditCard size={18} />
                            <span>주문하기</span>
                        </Link>
                    ) : (
                        <span
                            className={`${styles.orderButton} ${styles.orderButtonDisabled}`}
                            aria-disabled="true"
                        >
                            <CreditCard size={18} />
                            <span>주문하기</span>
                        </span>
                    )}
                </div>

                <AddToCartModal
                    open={cartModalOpen}
                    onClose={() => setCartModalOpen(false)}
                    menuName={menu.korName}
                />
            </div>
        </section>
    );
}
