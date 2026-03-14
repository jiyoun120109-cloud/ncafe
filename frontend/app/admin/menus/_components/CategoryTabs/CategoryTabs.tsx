'use client';

import { useCategories, CategoryResponseDto } from './useCategories';
import type { AdminCategoryDto } from '@/app/admin/_components/useAdminCategories';
import styles from './CategoryTabs.module.css';

interface CategoryTabsProps {
    selectedCategory: number | null;
    setSelectedCategory: (id: number | null) => void;
    adminCategories?: AdminCategoryDto[];
    totalCount?: number;
    menuCountByCategoryName?: Record<string, number>;
}

export default function CategoryTabs({
    selectedCategory,
    setSelectedCategory,
    adminCategories,
    totalCount,
    menuCountByCategoryName = {},
}: CategoryTabsProps) {
    const { categories: publicCategories, categoryCount: publicTotalCount } = useCategories();

    const categories = adminCategories ?? publicCategories;
    const totalCountDisplay = totalCount ?? publicTotalCount ?? 0;

    const getMenuCount = (cat: { id: number; name: string }) => {
        if (adminCategories && menuCountByCategoryName) {
            return menuCountByCategoryName[cat.name] ?? 0;
        }
        return (cat as CategoryResponseDto).menuCount ?? 0;
    };

    return (
        <nav className={styles.tabs}>
            <button
                className={`${styles.tab} ${selectedCategory === null ? styles.active : ''}`}
                onClick={() => setSelectedCategory(null)}
            >
                <span>전체</span>
                {totalCountDisplay > 0 && <span className={styles.count}>{totalCountDisplay}</span>}
            </button>

            {categories.map((category) => (
                <button
                    key={category.id}
                    className={`${styles.tab} ${selectedCategory === category.id ? styles.active : ''}`}
                    onClick={() => setSelectedCategory(category.id)}
                >
                    <span>{category.name}</span>
                    <span className={styles.count}>{getMenuCount(category)}</span>
                </button>
            ))}
        </nav>
    );
}


