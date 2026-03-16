'use client';

import type { MenuSortBy } from '../MenuList/useMenus';
import styles from './MenuFilterTabs.module.css';

const SORT_OPTIONS: { value: MenuSortBy | ''; label: string }[] = [
    { value: '', label: '기본' },
    { value: 'views_desc', label: '조회수순' },
    { value: 'likes_desc', label: '좋아요순' },
    { value: 'price_desc', label: '가격높은순' },
    { value: 'price_asc', label: '가격낮은순' },
    { value: 'name_asc', label: '한글이름순' },
    { value: 'name_eng_asc', label: '영어이름순' },
];

const STATUS_OPTIONS: { value: boolean | null; label: string }[] = [
    { value: null, label: '전체' },
    { value: true, label: '판매중' },
    { value: false, label: '품절' },
];

interface MenuFilterTabsProps {
    sortBy: MenuSortBy | null;
    setSortBy: (v: MenuSortBy | null) => void;
    isAvailable: boolean | null;
    setIsAvailable: (v: boolean | null) => void;
}

export default function MenuFilterTabs({
    sortBy,
    setSortBy,
    isAvailable,
    setIsAvailable,
}: MenuFilterTabsProps) {
    return (
        <div className={styles.wrapper}>
            <div className={styles.section}>
                <span className={styles.sectionLabel}>메뉴 정렬</span>
                <div className={styles.tabs}>
                    {SORT_OPTIONS.map((opt) => (
                        <button
                            key={opt.value || 'default'}
                            type="button"
                            className={`${styles.tab} ${sortBy === (opt.value || null) ? styles.active : ''}`}
                            onClick={() => setSortBy(opt.value || null)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className={styles.section}>
                <span className={styles.sectionLabel}>판매 상태</span>
                <div className={styles.tabs}>
                    {STATUS_OPTIONS.map((opt) => (
                        <button
                            key={opt.label}
                            type="button"
                            className={`${styles.tab} ${isAvailable === opt.value ? styles.active : ''}`}
                            onClick={() => setIsAvailable(opt.value)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
