'use client';

import { useState } from 'react';
import CategoryTabs from './_components/CategoryTabs/CategoryTabs';
import MenuSearchBar from './_components/MenuSearchBar/MenuSearchBar';
import MenuList from './_components/MenuList/MenuList';
import styles from './page.module.css';

export default function UserMenusPage() {
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className={styles.pageLayout}>
            {/* ── Aside: 카테고리 사이드바 ── */}
            <aside className={styles.aside}>
                <h2 className={styles.asideTitle}>카테고리</h2>
                <CategoryTabs
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                />
            </aside>

            {/* ── Main: 검색 + 메뉴 그리드 ── */}
            <main className={styles.main}>
                <div className={styles.mainHeader}>
                    <MenuSearchBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />
                </div>
                <MenuList
                    selectedCategory={selectedCategory}
                    searchQuery={searchQuery}
                />
            </main>
        </div>
    );
}
