'use client';

import { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import type { AdminCategoryDto } from '@/app/admin/_components/useAdminCategories';
import styles from './CategoryTabs.module.css';

interface SortableCategoryTabProps {
    category: AdminCategoryDto;
    menuCount: number;
    isActive: boolean;
    onClick: () => void;
    onEdit: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
}

export default function SortableCategoryTab({
    category,
    menuCount,
    isActive,
    onClick,
    onEdit,
    onDelete,
}: SortableCategoryTabProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category.id, data: { category } });

    const style = useMemo(
        () => ({
            transform: CSS.Transform.toString(transform),
            transition,
        }),
        [transform, transition]
    );

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${styles.tabWrapper} ${isDragging ? styles.tabWrapperDragging : ''}`}
        >
            <button
                type="button"
                className={styles.dragHandle}
                aria-label="순서 변경"
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
            >
                <GripVertical size={14} />
            </button>
            <button
                type="button"
                className={`${styles.tab} ${isActive ? styles.active : ''}`}
                onClick={onClick}
            >
                <span>{category.name}</span>
                <span className={styles.count}>{menuCount}</span>
            </button>
            <button
                type="button"
                className={styles.tabAction}
                onClick={onEdit}
                title="수정"
                aria-label="수정"
            >
                <Pencil size={12} />
            </button>
            <button
                type="button"
                className={styles.tabAction}
                onClick={onDelete}
                title="삭제"
                aria-label="삭제"
            >
                <Trash2 size={12} />
            </button>
        </div>
    );
}
