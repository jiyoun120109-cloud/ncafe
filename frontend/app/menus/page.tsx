'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CategoryTabs from './_components/CategoryTabs/CategoryTabs';
import MenuSearchBar from './_components/MenuSearchBar/MenuSearchBar';
import MenuList from './_components/MenuList/MenuList';
import { useUserCategories } from './_components/useUserCategories';
import styles from './page.module.css';

const SORT_OPTIONS = [
    { value: 'priority', label: '우선순위순' },
    { value: 'likes', label: '좋아요순' },
    { value: 'views', label: '조회순' },
    { value: 'price_asc', label: '가격 낮은순' },
    { value: 'price_desc', label: '가격 높은순' },
] as const;

function MenusPageContent() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get('category');
    const { categories } = useUserCategories();
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sort, setSort] = useState<string>('priority');
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (!categoryParam || categories.length === 0) return;
        const found = categories.find((c) => c.name === categoryParam);
        if (found) setSelectedCategory(found.id);
    }, [categoryParam, categories]);

    useEffect(() => {
        setPage(1);
    }, [selectedCategory, searchQuery, sort]);

    return (
        <div className={styles.pageLayout}>
            <aside className={styles.aside}>
                <h2 className={styles.asideTitle}>카테고리</h2>
                <CategoryTabs
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                />
            </aside>
            <main className={styles.main}>
                <div className={styles.mainHeader}>
                    <MenuSearchBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />
                    <div className={styles.sortWrap}>
                        <label htmlFor="menu-sort" className={styles.sortLabel}>
                            정렬
                        </label>
                        <select
                            id="menu-sort"
                            className={styles.sortSelect}
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            aria-label="메뉴 정렬"
                        >
                            {SORT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <MenuList
                    selectedCategory={selectedCategory}
                    searchQuery={searchQuery}
                    sort={sort}
                    page={page}
                    onPageChange={setPage}
                    pageSize={12}
                />
            </main>
        </div>
    );
}

function MenusPageFallback() {
    return (
        <div className={styles.pageLayout}>
            <aside className={styles.aside}>
                <h2 className={styles.asideTitle}>카테고리</h2>
                <div />
            </aside>
            <main className={styles.main}>
                <div className={styles.mainHeader} />
                <div />
            </main>
        </div>
    );
}

export default function UserMenusPage() {
    return (
        <Suspense fallback={<MenusPageFallback />}>
            <MenusPageContent />
        </Suspense>
    );
}
