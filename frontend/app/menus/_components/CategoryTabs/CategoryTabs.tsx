'use client';

import { useUserCategories } from '../useUserCategories';
import styles from './CategoryTabs.module.css';

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
                    <span>{category.name}</span>
                    <span className={styles.count}>{category.menuCount}</span>
                </button>
            ))}
        </nav>
    );
}
