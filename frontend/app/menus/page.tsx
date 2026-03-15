'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import CategoryTabs from './_components/CategoryTabs/CategoryTabs';
import MenuSearchBar from './_components/MenuSearchBar/MenuSearchBar';
import MenuList from './_components/MenuList/MenuList';
import { useUserCategories } from './_components/useUserCategories';
import styles from './page.module.css';

const LAST_MENUS_PATH_KEY = 'ncafe_last_menus_path';

const SORT_OPTIONS = [
    { value: 'priority', label: '인기' },
    { value: 'price_desc', label: '가격높은순' },
    { value: 'price_asc', label: '가격낮은순' },
    { value: 'likes', label: '좋아요순' },
    { value: 'name', label: '이름순' },
] as const;

function MenusPageContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search') ?? searchParams.get('q') ?? '';
    const sortParam = searchParams.get('sort') ?? 'priority';
    const pageParam = searchParams.get('page');
    const { categories } = useUserCategories();
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState(() => searchParam);
    const [sort, setSort] = useState<string>(() => (SORT_OPTIONS.some((o) => o.value === sortParam) ? sortParam : 'priority'));
    const [page, setPage] = useState(() => {
        const p = pageParam ? parseInt(pageParam, 10) : 1;
        return Number.isNaN(p) || p < 1 ? 1 : p;
    });
    /** URL이 ?category=음료 일 때 라떼·에이드·티·스무디만 표시 */
    const beverageCategoryNames = categoryParam === '음료' ? ['라떼', '에이드', '티', '스무디'] : undefined;

    useEffect(() => {
        if (!categoryParam || categories.length === 0) return;
        if (categoryParam === '음료') {
            setSelectedCategory(null);
            return;
        }
        const found = categories.find((c) => c.name === categoryParam);
        if (found) setSelectedCategory(found.id);
    }, [categoryParam, categories]);

    useEffect(() => {
        setPage(1);
    }, [selectedCategory, searchQuery, sort]);

    const buildMenusPath = useCallback(() => {
        const params = new URLSearchParams();
        if (categoryParam) params.set('category', categoryParam);
        if (searchQuery.trim()) params.set('search', searchQuery.trim());
        if (sort && sort !== 'priority') params.set('sort', sort);
        if (page > 1) params.set('page', String(page));
        const qs = params.toString();
        return qs ? `${pathname}?${qs}` : pathname;
    }, [pathname, categoryParam, searchQuery, sort, page]);

    // state → URL 반영 및 lastMenusPath 저장 (state만 의존해 루프 방지)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams();
        const catName = categoryParam === '음료' ? '음료' : (selectedCategory != null ? categories.find((c) => c.id === selectedCategory)?.name : null);
        if (catName) params.set('category', catName);
        if (searchQuery.trim()) params.set('search', searchQuery.trim());
        if (sort && sort !== 'priority') params.set('sort', sort);
        if (page > 1) params.set('page', String(page));
        const qs = params.toString();
        const newPath = qs ? `${pathname}?${qs}` : pathname;
        router.replace(newPath, { scroll: false });
        try {
            sessionStorage.setItem(LAST_MENUS_PATH_KEY, newPath);
        } catch (_) {}
    }, [pathname, selectedCategory, categories, searchQuery, sort, page, categoryParam, router]);

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
                    <nav className={styles.sortTabs} aria-label="메뉴 정렬">
                        {SORT_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                className={`${styles.sortTab} ${sort === opt.value ? styles.sortTabActive : ''}`}
                                onClick={() => setSort(opt.value)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <MenuList
                    selectedCategory={selectedCategory}
                    categoryNamesFilter={beverageCategoryNames}
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
