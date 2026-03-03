'use client';

import { Search } from 'lucide-react';
import styles from './MenuSearchBar.module.css';

interface MenuSearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export default function MenuSearchBar({ searchQuery, setSearchQuery }: MenuSearchBarProps) {
    return (
        <div className={styles.wrapper}>
            <Search className={styles.icon} size={18} aria-hidden />
            <input
                type="search"
                className={styles.input}
                placeholder="메뉴 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="메뉴 검색"
            />
        </div>
    );
}
