'use client';

import { useCategories, CategoryResponseDto } from './useCategories';
import { Plus } from 'lucide-react';
import styles from './CategoryTabs.module.css';
import { useState } from 'react';
import { useMenus } from '../MenuList/useMenus';


export default function CategoryTabs({ selectedCategory, setSelectedCategory }: { selectedCategory: number | null, setSelectedCategory: (id: number | null) => void }) {
    const { categories, categoryCount } = useCategories();
    // 컴포넌트 상단에 추가
    const { menus, setMenus } = useMenus({ categoryId: selectedCategory, searchQuery: '' });
    // const [selectedCategory, setSelectedCategory] = useState<number | null>(null);


    return (
        <nav className={styles.tabs}>
            <button
                className={`${styles.tab} ${selectedCategory === null ? styles.active : ''}`}
                onClick={() => {
                    setSelectedCategory(null);
                    // onCategoryChange(null);
                }}
            >
                <span>전체</span>
                {categoryCount !== null && categoryCount > 0 && <span className={styles.count}>{categoryCount}</span>}
            </button>

            {categories.map((category: CategoryResponseDto) => (
                <button
                    key={category.id}
                    className={`${styles.tab} ${selectedCategory === category.id ? styles.active : ''}`}
                    onClick={() => {
                        setSelectedCategory(category.id);
                        // onCategoryChange(category.id);
                        console.log('클릭한 카테고리 ID:', category.id);
                    }}
                >
                    <span>{category.name}</span>
                    <span className={styles.count}>{category.menuCount}</span>
                </button>
            ))}

            <button className={styles.addCategoryBtn} title="카테고리 추가">
                <Plus size={18} />
            </button>
        </nav>
    );
}


