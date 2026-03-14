'use client';

import { useEffect, useState, useMemo } from 'react';
import { useUIStore } from '@/stores/uiStore';

import MenuList from './_components/MenuList';
import MenuToolbar from './_components/MenuToolbar';
import CategoryTabs from './_components/CategoryTabs';
import { useAdminCategories } from '../_components/useAdminCategories';
import { useMenus } from './_components/MenuList/useMenus';
import styles from './page.module.css';

const PAGE_SIZE = 12;

export default function AdminMenusPage() {
    const { setTitle } = useUIStore();
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);

    const { categories: adminCategories } = useAdminCategories();

    const { menus: allMenus } = useMenus({ categoryId: null, searchQuery: '' });

    const { totalCount, menuCountByCategoryName } = useMemo(() => {
        const byName: Record<string, number> = {};
        let total = 0;
        (allMenus || []).forEach((m: { categoryName?: string }) => {
            total += 1;
            const name = m.categoryName || '';
            byName[name] = (byName[name] || 0) + 1;
        });
        return { totalCount: total, menuCountByCategoryName: byName };
    }, [allMenus]);

    useEffect(() => { setTitle('메뉴 관리'); }, [setTitle]);
    useEffect(() => { setPage(1); }, [selectedCategory, searchQuery]);

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <p className={styles.pageLabel}>Menu Management</p>
                <h2 className={styles.pageTitle}>메뉴 관리</h2>
            </div>

            <div className={styles.divider} />

            <MenuToolbar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            <CategoryTabs
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                adminCategories={adminCategories}
                totalCount={totalCount}
                menuCountByCategoryName={menuCountByCategoryName}
            />

            <MenuList
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
                page={page}
                onPageChange={setPage}
                pageSize={PAGE_SIZE}
            />
        </div>
    );
}
