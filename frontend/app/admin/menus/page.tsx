'use client';

import { useEffect, useState } from 'react';
import { useUIStore } from '@/stores/uiStore';

import MenuList from './_components/MenuList';
import MenuToolbar from './_components/MenuToolbar';
import CategoryTabs from './_components/CategoryTabs';
import styles from './page.module.css';

export default function AdminMenusPage() {
    const { setTitle } = useUIStore();
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { setTitle('메뉴 관리'); }, [setTitle]);

    return (
        <div className={styles.page}>
            {/* 페이지 헤더 — 대시보드와 동일한 패턴 */}
            <div className={styles.pageHeader}>
                <p className={styles.pageLabel}>Menu Management</p>
                <h2 className={styles.pageTitle}>메뉴 관리</h2>
            </div>

            {/* 구분선 */}
            <div className={styles.divider} />

            {/* 툴바 */}
            <MenuToolbar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            {/* 카테고리 탭 */}
            <CategoryTabs
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
            />

            {/* 메뉴 그리드 */}
            <MenuList
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
            />
        </div>
    );
}
