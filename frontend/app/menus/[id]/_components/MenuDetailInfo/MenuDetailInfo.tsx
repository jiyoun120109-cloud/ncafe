'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { Heart, Minus, Plus, ShoppingCart, CreditCard } from 'lucide-react';
import AddToCartModal from '../../../_components/AddToCartModal/AddToCartModal';
import { useFavorites } from '@/hooks/useFavorites';
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

/** optionsJson 파싱 결과 한 그룹 */
interface ParsedOptionGroup {
    name: string;
    type: 'radio' | 'checkbox';
    required: boolean;
    items: { name: string; priceDelta: number }[];
}

interface MenuDetailInfoProps {
    id: string;
}

function parseOptionsJson(json: string | null | undefined): ParsedOptionGroup[] {
    if (!json?.trim()) return [];
    try {
        const raw = JSON.parse(json) as { name?: string; type?: string; required?: boolean; items?: { name?: string; priceDelta?: number }[] }[];
        if (!Array.isArray(raw)) return [];
        return raw.map((o) => ({
            name: o.name ?? '',
            type: o.type === 'checkbox' ? 'checkbox' : 'radio',
            required: Boolean(o.required),
            items: Array.isArray(o.items) ? o.items.map((it) => ({ name: it.name ?? '', priceDelta: Number(it.priceDelta) || 0 })) : [],
        }));
    } catch {
        return [];
    }
}

export default function MenuDetailInfo({ id }: MenuDetailInfoProps) {
    const router = useRouter();
    const { menu, loading, error } = useUserMenuDetail(id);
    const { addItem } = useCart();
    const { isFavorite, toggleFavorite, isAuthenticated } = useFavorites();
    const [quantity, setQuantity] = useState(1);
    const [cartModalOpen, setCartModalOpen] = useState(false);
    const [temperature, setTemperature] = useState<'HOT' | 'ICED'>('HOT');
    const [beanOption, setBeanOption] = useState('');
    const [decaf, setDecaf] = useState(false);

    const dynamicOptions = useMemo(() => parseOptionsJson(menu?.optionsJson ?? null), [menu?.optionsJson]);
    const useDynamicOptions = dynamicOptions.length > 0;

    const [dynamicSelections, setDynamicSelections] = useState<Record<string, string | string[]>>({});

    useEffect(() => {
        if (dynamicOptions.length === 0) return;
        setDynamicSelections((prev) => {
            const next = { ...prev };
            dynamicOptions.forEach((g) => {
                if (next[g.name] !== undefined) return;
                if (g.type === 'radio' && g.items.length > 0) next[g.name] = g.items[0].name;
                else if (g.type === 'checkbox') next[g.name] = [];
            });
            return next;
        });
    }, [dynamicOptions]);

    const isCoffee = menu?.categoryName === '커피';
    const legacyOptionsPrice = isCoffee && decaf ? DECAF_EXTRA : 0;
    const dynamicOptionsPrice = useDynamicOptions
        ? dynamicOptions.reduce((sum, g) => {
              const sel = dynamicSelections[g.name];
              if (g.type === 'radio' && typeof sel === 'string') {
                  const it = g.items.find((i) => i.name === sel);
                  return sum + (it?.priceDelta ?? 0);
              }
              if (g.type === 'checkbox' && Array.isArray(sel)) {
                  return sum + sel.reduce((s, name) => s + (g.items.find((i) => i.name === name)?.priceDelta ?? 0), 0);
              }
              return sum;
          }, 0)
        : 0;
    const optionsPrice = useDynamicOptions ? dynamicOptionsPrice : legacyOptionsPrice;
    const totalUnitPrice = (menu?.price ?? 0) + optionsPrice;

    const productInfo = useMemo((): ProductInfo | null => {
        if (!menu?.productInfoJson?.trim()) return null;
        try {
            return JSON.parse(menu.productInfoJson) as ProductInfo;
        } catch {
            return null;
        }
    }, [menu?.productInfoJson]);

    const buildCartOptions = (): CartItemOptions => {
        if (useDynamicOptions) {
            const temp = dynamicSelections['온도'];
            const bean = dynamicSelections['원두'];
            const decafSel = dynamicSelections['디카페인'];
            return {
                temperature: typeof temp === 'string' && (temp === 'HOT' || temp === 'ICED') ? temp : undefined,
                beanOption: typeof bean === 'string' && bean ? bean : undefined,
                decaf: Array.isArray(decafSel) ? decafSel.length > 0 : typeof decafSel === 'string' && decafSel.length > 0,
            };
        }
        if (isCoffee) return { temperature, beanOption: beanOption || undefined, decaf };
        return {};
    };

    const handleAddToCart = () => {
        if (!menu?.isAvailable) return;
        addItem(menu.id, quantity, buildCartOptions())
            .then(() => setCartModalOpen(true))
            .catch(() => {});
    };

    const handleOrderDirectly = () => {
        if (!menu?.isAvailable) return;
        addItem(menu.id, quantity, buildCartOptions())
            .then(() => router.push('/order'))
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

    const favorite = menu ? isFavorite(menu.id) : false;

    return (
        <section className={styles.infoSection}>
            <div className={styles.infoCard}>
                <div className={styles.titleRow}>
                    <div>
                        <span className={styles.categoryBadge}>{menu.categoryName}</span>
                        <h1 className={styles.korName}>{menu.korName}</h1>
                    </div>
                    <button
                        type="button"
                        className={styles.favoriteBtn}
                        aria-label={!isAuthenticated ? '로그인 후 찜하기' : favorite ? `${menu.korName} 찜 해제` : `${menu.korName} 찜하기`}
                        onClick={() => {
                            if (!isAuthenticated) {
                                router.push(`/login?returnUrl=${encodeURIComponent(`/menus/${id}`)}`);
                                return;
                            }
                            toggleFavorite(menu.id);
                        }}
                        title={!isAuthenticated ? '로그인 후 찜할 수 있어요' : favorite ? '찜 해제' : '찜하기'}
                    >
                        <Heart
                            size={22}
                            className={favorite ? styles.heartFilled : ''}
                            fill={favorite ? 'currentColor' : 'none'}
                        />
                    </button>
                </div>
                <p className={styles.engName}>{menu.engName}</p>
                <p className={styles.price}>
                    {menu.price.toLocaleString()}원
                    {(optionsPrice > 0) && (
                        <span className={styles.optionExtra}> + 옵션 {optionsPrice.toLocaleString()}원</span>
                    )}
                </p>
                <p className={styles.description}>{menu.description}</p>

                {useDynamicOptions ? (
                    dynamicOptions.map((group) => (
                        <div key={group.name} className={styles.optionSection}>
                            <p className={styles.optionLabel}>
                                {group.name}
                                {group.required && <span className={styles.requiredMark}> *</span>}
                            </p>
                            {group.type === 'radio' ? (
                                <div className={styles.temperatureRow}>
                                    {group.items.map((item) => (
                                        <button
                                            key={item.name}
                                            type="button"
                                            className={dynamicSelections[group.name] === item.name ? styles.tempBtnActive : styles.tempBtn}
                                            onClick={() => setDynamicSelections((s) => ({ ...s, [group.name]: item.name }))}
                                            disabled={!menu.isAvailable}
                                        >
                                            {item.name}
                                            {item.priceDelta !== 0 && ` (+${item.priceDelta.toLocaleString()}원)`}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.checkboxGroup}>
                                    {group.items.map((item) => {
                                        const sel = dynamicSelections[group.name];
                                        const checked = Array.isArray(sel) && sel.includes(item.name);
                                        return (
                                            <label key={item.name} className={styles.decafLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={(e) => {
                                                        setDynamicSelections((s) => {
                                                            const arr = (Array.isArray(s[group.name]) ? s[group.name] : []) as string[];
                                                            const next = e.target.checked ? [...arr, item.name] : arr.filter((x) => x !== item.name);
                                                            return { ...s, [group.name]: next };
                                                        });
                                                    }}
                                                    disabled={!menu.isAvailable}
                                                    className={styles.decafCheckbox}
                                                />
                                                <span>
                                                    {item.name}
                                                    {item.priceDelta !== 0 && ` (+${item.priceDelta.toLocaleString()}원)`}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))
                ) : isCoffee ? (
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
                ) : null}

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
                        <button
                            type="button"
                            className={styles.orderButton}
                            aria-label="주문하기"
                            onClick={handleOrderDirectly}
                        >
                            <CreditCard size={18} />
                            <span>주문하기</span>
                        </button>
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
