'use client';

import { useMemo } from 'react';
import styles from './MenuDetailInfo.module.css';
import { useMenuDetail } from './useMenuDetail';
import type { ProductInfo } from '@/types/menu';

export default function MenuDetailInfo({ id }: { id: number }) {
    const { menu, loading, error } = useMenuDetail(id);

    const productInfo = useMemo((): ProductInfo | null => {
        if (!menu?.productInfoJson?.trim()) return null;
        try {
            return JSON.parse(menu.productInfoJson) as ProductInfo;
        } catch {
            return null;
        }
    }, [menu?.productInfoJson]);

    if (loading) {
        return (
            <section className={styles.infoSection}>
                <div className={styles.infoCard}><p className={styles.loading}>로딩 중...</p></div>
            </section>
        );
    }
    if (error || !menu) {
        return (
            <section className={styles.infoSection}>
                <div className={styles.infoCard}><p className={styles.error}>{error ?? '메뉴를 찾을 수 없습니다.'}</p></div>
            </section>
        );
    }

    const nut = productInfo?.nutrition;
    const hasNutrition = nut && Object.values(nut).some((v) => v != null);
    const allergens = productInfo?.allergens ?? [];

    return (
        <section className={styles.infoSection}>
            <div className={styles.infoCard}>
                <div className={styles.basicInfo}>
                    <div className={styles.titleRow}>
                        <div className={styles.tagWrapper}>
                            <span className={styles.categoryBadge}>
                                {menu.categoryName}
                            </span>
                        </div>
                        <h1 className={styles.korName}>{menu.korName}</h1>
                        <p className={styles.engName}>{menu.engName}</p>
                    </div>
                    <p className={styles.price}>{menu.price?.toLocaleString?.() ?? menu.price}원</p>
                    <p className={styles.description}>{menu.description}</p>
                </div>

                <div className={styles.statsSection}>
                    <h2 className={styles.sectionTitle}>주간 퍼포먼스</h2>
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <div className={styles.statLabel}>주간 판매량</div>
                            <div className={styles.statValue}>-</div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.statLabel}>재주문율</div>
                            <div className={styles.statValue}>-</div>
                        </div>
                    </div>
                </div>

                <div className={styles.statusSection}>
                    <h2 className={styles.sectionTitle}>판매 상태</h2>
                    <div className={styles.statusGrid}>
                        <div className={`${styles.statusItem} ${menu.isAvailable ? styles.activeStatus : ''}`}>
                            <span>판매중</span>
                        </div>
                        <div className={`${styles.statusItem} ${!menu.isAvailable ? styles.activeSoldOut : ''}`}>
                            <span>품절</span>
                        </div>
                    </div>
                </div>

                <div className={styles.nutritionSection}>
                    <h2 className={styles.sectionTitle}>제품 정보 (상품 정보 제공 고시)</h2>
                    {productInfo ? (
                        <>
                            {(productInfo.weightG != null || productInfo.calorieKcal != null) && (
                                <div className={styles.nutritionGrid}>
                                    {productInfo.weightG != null && (
                                        <div className={styles.nutritionItem}>
                                            <span className={styles.nutLabel}>내용량</span>
                                            <span className={styles.nutValue}>{productInfo.weightG} g</span>
                                        </div>
                                    )}
                                    {productInfo.calorieKcal != null && (
                                        <div className={styles.nutritionItem}>
                                            <span className={styles.nutLabel}>열량</span>
                                            <span className={styles.nutValue}>{productInfo.calorieKcal} kcal</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            {hasNutrition && (
                                <div className={styles.nutritionGrid}>
                                    {nut!.sodiumMg != null && (
                                        <div className={styles.nutritionItem}>
                                            <span className={styles.nutLabel}>나트륨</span>
                                            <span className={styles.nutValue}>{nut!.sodiumMg} mg</span>
                                        </div>
                                    )}
                                    {nut!.carbsG != null && (
                                        <div className={styles.nutritionItem}>
                                            <span className={styles.nutLabel}>탄수화물</span>
                                            <span className={styles.nutValue}>{nut!.carbsG} g</span>
                                        </div>
                                    )}
                                    {nut!.sugarsG != null && (
                                        <div className={styles.nutritionItem}>
                                            <span className={styles.nutLabel}>당류</span>
                                            <span className={styles.nutValue}>{nut!.sugarsG} g</span>
                                        </div>
                                    )}
                                    {nut!.fatG != null && (
                                        <div className={styles.nutritionItem}>
                                            <span className={styles.nutLabel}>지방</span>
                                            <span className={styles.nutValue}>{nut!.fatG} g</span>
                                        </div>
                                    )}
                                    {nut!.proteinG != null && (
                                        <div className={styles.nutritionItem}>
                                            <span className={styles.nutLabel}>단백질</span>
                                            <span className={styles.nutValue}>{nut!.proteinG} g</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            {allergens.length > 0 && (
                                <div className={styles.allergenInfo}>
                                    <div className={styles.allergenTitle}>알레르기 유발 물질</div>
                                    <div className={styles.allergenTags}>
                                        {allergens.map((a) => (
                                            <span key={a} className={styles.allergenTag} title={a}>{a}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {productInfo.storage && (
                                <p className={styles.storage}>보관방법: {productInfo.storage}</p>
                            )}
                        </>
                    ) : (
                        <p className={styles.noProductInfo}>등록된 제품 정보가 없습니다.</p>
                    )}
                </div>

                <div className={styles.metaSection}>
                    <div className={styles.metaItem}>
                        <span>최초 등록 : {menu.createdAt?.split('T')[0]} </span>
                    </div>
                    <div className={styles.metaItem}>
                        <span>최종 수정 : {menu.updatedAt?.split('T')[0]} </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
