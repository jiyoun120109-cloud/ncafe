'use client';

import { useUserMenus } from '../useUserMenus';
import { Coffee } from 'lucide-react';
import MenuCard from '../MenuCard/MenuCard';
import styles from './MenuList.module.css';

interface MenuListProps {
    selectedCategory: number | null;
    searchQuery: string;
}

export default function MenuList({ selectedCategory, searchQuery }: MenuListProps) {
    const { menus, loading } = useUserMenus({ categoryId: selectedCategory, searchQuery });

    if (loading) {
        return (
            <section className={styles.container}>
                <div className={styles.loadingState}>
                    <div className={styles.spinner} />
                    <span>메뉴를 불러오는 중...</span>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.container}>
            {menus.length > 0 ? (
                <div className={styles.grid}>
                    {menus.map((menu) => (
                        <MenuCard key={menu.id} menu={menu} />
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <Coffee size={40} />
                    <h3 className={styles.emptyTitle}>메뉴가 없습니다</h3>
                    <p className={styles.emptyDesc}>다른 카테고리를 선택하거나 검색어를 변경해보세요</p>
                </div>
            )}
        </section>
    );
}
