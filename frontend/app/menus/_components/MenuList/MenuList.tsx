'use client';

import { useUserMenus } from '../useUserMenus';
import { Coffee, ChevronLeft, ChevronRight } from 'lucide-react';
import MenuCard from '../MenuCard/MenuCard';
import styles from './MenuList.module.css';

const DEFAULT_PAGE_SIZE = 12;

interface MenuListProps {
    selectedCategory: number | null;
    searchQuery: string;
    sort?: string;
    page?: number;
    onPageChange?: (page: number) => void;
    pageSize?: number;
}

export default function MenuList({ selectedCategory, searchQuery, sort = 'priority', page = 1, onPageChange, pageSize = DEFAULT_PAGE_SIZE }: MenuListProps) {
    const { menus, loading } = useUserMenus({ categoryId: selectedCategory, searchQuery, sort });
    const total = menus.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * pageSize;
    const pageMenus = menus.slice(start, start + pageSize);

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
                <>
                    <div className={styles.grid}>
                        {pageMenus.map((menu) => (
                            <MenuCard key={menu.id} menu={menu} />
                        ))}
                    </div>
                    {totalPages > 1 && onPageChange && (
                        <nav className={styles.pagination} aria-label="메뉴 페이지">
                            <button
                                type="button"
                                className={styles.pageBtn}
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage <= 1}
                                aria-label="이전 페이지"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className={styles.pageNumbers}>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        className={`${styles.pageNum} ${p === currentPage ? styles.pageNumActive : ''}`}
                                        onClick={() => onPageChange(p)}
                                        aria-label={`${p}페이지`}
                                        aria-current={p === currentPage ? 'page' : undefined}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <button
                                type="button"
                                className={styles.pageBtn}
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                aria-label="다음 페이지"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </nav>
                    )}
                </>
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
