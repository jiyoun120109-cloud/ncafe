'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CategoryTabs from './_components/CategoryTabs/CategoryTabs';
import MenuSearchBar from './_components/MenuSearchBar/MenuSearchBar';
import MenuList from './_components/MenuList/MenuList';
import { useUserCategories } from './_components/useUserCategories';
import styles from './page.module.css';

function MenusPageContent() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get('category');
    const { categories } = useUserCategories();
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (!categoryParam || categories.length === 0) return;
        const found = categories.find((c) => c.name === categoryParam);
        if (found) setSelectedCategory(found.id);
    }, [categoryParam, categories]);

    useEffect(() => {
        setPage(1);
    }, [selectedCategory, searchQuery]);

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
                </div>
                <MenuList
                    selectedCategory={selectedCategory}
                    searchQuery={searchQuery}
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
