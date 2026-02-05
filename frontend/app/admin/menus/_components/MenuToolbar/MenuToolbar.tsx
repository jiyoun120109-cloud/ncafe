'use client';

import { Search, Plus } from 'lucide-react';
import Link from 'next/link';
import styles from './MenuToolbar.module.css';

interface MenuToolbarProps {
    searchQuery?: string;
    setSearchQuery?: (query: string) => void;
}


export default function MenuToolbar({ searchQuery, setSearchQuery }: MenuToolbarProps) {

    return (
        /*섹션추가, 제목추가, 컴포넌트 분리할때는 제목 꼭 넣어주기*/
        <div className={styles.header}>
            <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} size={18} />
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="메뉴명을 입력하세요..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery?.(e.target.value)}
                />
            </div>

            <div className={styles.actions}>
                <Link href="/admin/menus/new" className={styles.addBtn}>
                    <Plus size={18} />
                    <span>새 메뉴 추가</span>
                </Link>
            </div>
        </div>
    );
}
