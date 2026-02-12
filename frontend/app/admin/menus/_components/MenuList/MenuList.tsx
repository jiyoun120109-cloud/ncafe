'use client';

import { useMenus } from './useMenus';
import { Coffee } from 'lucide-react';
import MenuCard from '../MenuCard';
import styles from './MenuList.module.css';

interface MenuListProps {
    selectedCategory: number | null;
    searchQuery: string;
}

export default function MenuList({ selectedCategory, searchQuery }: MenuListProps) {

    //GET: /admin/menus?categoryId=1&searchQuery=coffee&page=0&size=10
    const { menus, setMenus } = useMenus({ categoryId: selectedCategory, searchQuery });

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
                    <Coffee size={48} />
                    <h3>메뉴가 없습니다</h3>
                </div>
            )}
        </section>
    );
}


