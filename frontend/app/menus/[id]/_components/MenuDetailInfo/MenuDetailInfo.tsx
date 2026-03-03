'use client';

import styles from './MenuDetailInfo.module.css';
import { useUserMenuDetail } from '../useUserMenuDetail';

interface MenuDetailInfoProps {
    id: string;
}

export default function MenuDetailInfo({ id }: MenuDetailInfoProps) {
    const { menu, loading, error } = useUserMenuDetail(id);

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
                <p className={styles.price}>{menu.price.toLocaleString()}원</p>
                <p className={styles.description}>{menu.description}</p>
                <div className={styles.statusRow}>
                    <span className={menu.isAvailable ? styles.statusAvailable : styles.statusSoldOut}>
                        {menu.isAvailable ? '판매중' : '품절'}
                    </span>
                </div>
            </div>
        </section>
    );
}
