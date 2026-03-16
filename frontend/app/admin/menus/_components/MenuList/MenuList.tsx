'use client';

import { useCallback, useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { Coffee, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MenuResponse } from './useMenus';
import { getApiBase } from '@/services/api';
import MenuCard from '../MenuCard';
import SortableMenuCard from './SortableMenuCard';
import styles from './MenuList.module.css';

const DEFAULT_PAGE_SIZE = 12;

interface MenuListProps {
    menus: MenuResponse[];
    setMenus: (menus: MenuResponse[] | ((prev: MenuResponse[]) => MenuResponse[])) => void;
    refetch: () => void;
    page?: number;
    onPageChange?: (page: number) => void;
    pageSize?: number;
}

export default function MenuList({
    menus,
    setMenus,
    refetch,
    page = 1,
    onPageChange,
    pageSize = DEFAULT_PAGE_SIZE,
}: MenuListProps) {
    const [activeMenu, setActiveMenu] = useState<MenuResponse | null>(null);

    const total = menus.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * pageSize;
    const pageMenus = menus.slice(start, start + pageSize);

    const reorderAndSave = useCallback(
        async (orderedIds: number[], previousMenus: MenuResponse[]) => {
            try {
                const res = await fetch(`${getApiBase()}/admin/menus/reorder`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ orderedIds }),
                });
                if (!res.ok) throw new Error('순서 저장에 실패했습니다.');
                // 성공 시 refetch 하지 않음 — 낙관적 업데이트로 이미 반영됨
            } catch (err) {
                console.error(err);
                setMenus(previousMenus);
                alert(err instanceof Error ? err.message : '순서 저장에 실패했습니다.');
            }
        },
        [setMenus]
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const menu = event.active.data.current?.menu as MenuResponse | undefined;
        if (menu) setActiveMenu(menu);
    }, []);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) {
                setActiveMenu(null);
                return;
            }

            const oldIndex = pageMenus.findIndex((m) => m.id === active.id);
            const newIndex = pageMenus.findIndex((m) => m.id === over.id);
            if (oldIndex === -1 || newIndex === -1) {
                setActiveMenu(null);
                return;
            }

            const reorderedPage = arrayMove(pageMenus, oldIndex, newIndex);
            const fullOrder = [
                ...menus.slice(0, start),
                ...reorderedPage,
                ...menus.slice(start + reorderedPage.length),
            ];
            const orderedIds = fullOrder.map((m) => m.id);
            const previousMenus = menus.slice();

            setMenus(fullOrder);
            setActiveMenu(null);
            reorderAndSave(orderedIds, previousMenus);
        },
        [pageMenus, menus, start, reorderAndSave, setMenus]
    );

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    const sortableIds = pageMenus.map((m) => m.id);

    return (
        <section className={styles.container}>
            {menus.length > 0 ? (
                <>
                    <DndContext
                        sensors={sensors}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
                            <div className={styles.grid}>
                                {pageMenus.map((menu) => (
                                    <SortableMenuCard
                                        key={menu.id}
                                        menu={menu}
                                        onUpdated={refetch}
                                    />
                                ))}
                            </div>
                        </SortableContext>

                        <DragOverlay
                            dropAnimation={{
                                duration: 200,
                                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                                sideEffects: defaultDropAnimationSideEffects({
                                    styles: { active: { opacity: '0.5' } },
                                }),
                            }}
                        >
                            {activeMenu ? (
                                <div className={styles.overlayItem}>
                                    <MenuCard menu={activeMenu} />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>

                    {totalPages > 1 && onPageChange && (
                        <nav className={styles.pagination} aria-label="메뉴 페이지">
                            <button
                                type="button"
                                className={styles.arrowBtn}
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
                                className={styles.arrowBtn}
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
                    <Coffee size={48} />
                    <h3 className={styles.emptyTitle}>메뉴가 없습니다</h3>
                </div>
            )}
        </section>
    );
}
