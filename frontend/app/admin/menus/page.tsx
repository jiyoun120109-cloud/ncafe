'use client';

import { useEffect, useState } from 'react';
import { useUIStore } from '@/stores/uiStore';

import MenuList from './_components/MenuList';
import MenuToolbar from './_components/MenuToolbar';
import CategoryTabs from './_components/CategoryTabs';
import styles from './page.module.css';

export default function AdminMenusPage() {
    const { setTitle } = useUIStore();

    //Lifting State Up
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { setTitle('메뉴 관리'); }, [setTitle]);

    // const handleCategoryChange = (id: number | null) => {
    //     setSelectedCategory(id);
    // };

    return (
        <main className={styles.container}>
            <MenuToolbar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />
            {/* callback property 사용 */}
            <CategoryTabs
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
            />

            {/* 메뉴 그리드 (데이터 로딩 및 관리는 내부에서 수행) */}
            <MenuList
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
            />
        </main>
    );
}

