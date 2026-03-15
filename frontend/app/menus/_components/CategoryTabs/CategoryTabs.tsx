'use client';

import { useUserCategories } from '../useUserCategories';
import styles from './CategoryTabs.module.css';

function isIconUrl(icon: string | null | undefined): boolean {
    if (!icon || !icon.trim()) return false;
    const t = icon.trim();
    return t.startsWith('http') || t.startsWith('/');
}

function getIconSrc(icon: string): string {
    const t = icon.trim();
    if (t.startsWith('http')) return t;
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return t.startsWith('/') ? base + t : base + '/' + t;
}

interface CategoryTabsProps {
    selectedCategory: number | null;
    setSelectedCategory: (id: number | null) => void;
}

export default function CategoryTabs({ selectedCategory, setSelectedCategory }: CategoryTabsProps) {
    const { categories, totalCount } = useUserCategories();

    return (
        <nav className={styles.tabs}>
            <button
                type="button"
                className={`${styles.tab} ${selectedCategory === null ? styles.active : ''}`}
                onClick={() => setSelectedCategory(null)}
            >
                <span>전체</span>
                {totalCount != null && totalCount > 0 && (
                    <span className={styles.count}>{totalCount}</span>
                )}
            </button>
            {categories.map((category) => (
                <button
                    key={category.id}
                    type="button"
                    className={`${styles.tab} ${selectedCategory === category.id ? styles.active : ''}`}
                    onClick={() => setSelectedCategory(category.id)}
                >
                    <span className={styles.tabLabel}>
                        {category.icon && isIconUrl(category.icon) ? (
                            <img
                                src={getIconSrc(category.icon)}
                                alt=""
                                className={styles.tabIconImg}
                            />
                        ) : category.icon?.trim() ? (
                            <span className={styles.tabIconEmoji}>{category.icon.trim()}</span>
                        ) : null}
                        <span>{category.name}</span>
                    </span>
                    <span className={styles.count}>{category.menuCount}</span>
                </button>
            ))}
        </nav>
    );
}
