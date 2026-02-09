'use client';

import styles from './MenuDetailInfo.module.css';
import { useMenuDetail } from './useMenuDetail';

export default function MenuDetailInfo({ id }: { id: number }) {

    const { menu } = useMenuDetail(id);

    return (
        <section className={styles.infoSection}>
            <div className={styles.infoCard}>
                <div className={styles.basicInfo}>
                    <div className={styles.titleRow}>
                        <div className={styles.tagWrapper}>
                            <span className={styles.categoryBadge}>
                                {menu?.categoryName}
                            </span>
                            {/* Mock Tags */}
                            <span className={`${styles.tag} ${styles.best}`}>
                            </span>
                            <span className={`${styles.tag} ${styles.signature}`}>

                            </span>
                        </div>
                        <h1 className={styles.korName}>{menu?.korName}</h1>
                        <p className={styles.engName}>{menu?.engName}</p>
                    </div>
                    <p className={styles.price}>{menu?.price}</p>
                    <p className={styles.description}>{menu?.description}</p>
                </div>

                {/* Sales Snapshot (Mock) */}
                <div className={styles.statsSection}>
                    <h2 className={styles.sectionTitle}>주간 퍼포먼스</h2>
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <div className={styles.statLabel}>주간 판매량</div>
                            <div className={styles.statValue}>
                            </div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.statLabel}>재주문율</div>
                            <div className={styles.statValue}>

                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.statusSection}>
                    <h2 className={styles.sectionTitle}>판매 상태</h2>
                    <div className={styles.statusGrid}>
                        <div className={`${styles.statusItem} ${menu?.isAvailable ? styles.activeStatus : ''}`}>
                            <span>판매중</span>
                        </div>
                        <div className={`${styles.statusItem} ${!menu?.isAvailable ? styles.activeSoldOut : ''}`}>
                            <span>품절</span>
                        </div>
                    </div>
                </div>

                {/* Nutritional & Allergen Info (Mock) */}
                <div className={styles.nutritionSection}>
                    <div className={styles.nutritionHeader}>
                        <h2 className={styles.sectionTitle}>영양 성분 및 알레르기</h2>
                    </div>
                    <div className={styles.nutritionGrid}>
                        <div className={styles.nutritionItem}>
                            <span className={styles.nutLabel}>칼로리</span>
                            <span className={styles.nutValue}>125 kcal</span>
                        </div>
                        <div className={styles.nutritionItem}>
                            <span className={styles.nutLabel}>당류</span>
                            <span className={styles.nutValue}>12 g</span>
                        </div>
                        <div className={styles.nutritionItem}>
                            <span className={styles.nutLabel}>카페인</span>
                            <span className={styles.nutValue}>150 mg</span>
                        </div>
                    </div>
                    <div className={styles.allergenInfo}>
                        <div className={styles.allergenTitle}>알레르기 유발 물질:</div>
                        <div className={styles.allergenTags}>
                            <span className={styles.allergenTag} title="우유 포함">
                                우유
                            </span>
                            <span className={styles.allergenTag} title="대두 포함">
                                대두
                            </span>
                            <span className={styles.allergenTag} title="밀 포함">
                                밀
                            </span>
                        </div>
                    </div>
                </div>



                <div className={styles.metaSection}>
                    <div className={styles.metaItem}>
                        <span>최초 등록 : {menu?.createdAt?.split('T')[0]} </span>
                    </div>
                    <div className={styles.metaItem}>
                        <span>최종 수정 : {menu?.updatedAt?.split('T')[0]} </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
