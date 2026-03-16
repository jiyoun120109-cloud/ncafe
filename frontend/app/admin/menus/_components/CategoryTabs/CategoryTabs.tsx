'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useCategories, CategoryResponseDto } from './useCategories';
import type { AdminCategoryDto } from '@/app/admin/_components/useAdminCategories';
import SortableCategoryTab from './SortableCategoryTab';
import styles from './CategoryTabs.module.css';

const EMOJI_QUICK = ['☕', '🍵', '🥤', '🍰', '🥐', '🍩', '🥪', '🍪'];

export interface CategoryActions {
    createCategory: (name: string, icon?: string | null) => Promise<AdminCategoryDto | null>;
    updateCategory: (id: number, name: string, icon?: string | null) => Promise<void>;
    deleteCategory: (id: number) => Promise<void>;
    uploadCategoryIcon?: (file: File) => Promise<{ url: string; filename: string }>;
    reorderCategories: (categoryIds: number[]) => Promise<void>;
}

interface CategoryTabsProps {
    selectedCategory: number | null;
    setSelectedCategory: (id: number | null) => void;
    adminCategories?: AdminCategoryDto[];
    totalCount?: number;
    menuCountByCategoryName?: Record<string, number>;
    categoryActions?: CategoryActions;
}

export default function CategoryTabs({
    selectedCategory,
    setSelectedCategory,
    adminCategories,
    totalCount,
    menuCountByCategoryName = {},
    categoryActions,
}: CategoryTabsProps) {
    const { categories: publicCategories, categoryCount: publicTotalCount } = useCategories();

    const useAdminData = adminCategories != null;
    const categories = useAdminData ? adminCategories : publicCategories;
    const totalCountDisplay = useAdminData ? (totalCount ?? 0) : (publicTotalCount ?? 0);
    const isAdminWithActions = useAdminData && categoryActions != null;

    const getMenuCount = (cat: { id: number; name: string }) => {
        if (useAdminData && menuCountByCategoryName) {
            return menuCountByCategoryName[cat.name] ?? 0;
        }
        return (cat as CategoryResponseDto).menuCount ?? 0;
    };

    /* ---------- Add/Edit modal state ---------- */
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<AdminCategoryDto | null>(null);
    const [addName, setAddName] = useState('');
    const [addIcon, setAddIcon] = useState('');
    const [editName, setEditName] = useState('');
    const [editIcon, setEditIcon] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [uploadingIcon, setUploadingIcon] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const addIconInputRef = useRef<HTMLInputElement>(null);
    const editIconInputRef = useRef<HTMLInputElement>(null);

    const openAdd = useCallback(() => {
        setAddName('');
        setAddIcon('');
        setError(null);
        setAddModalOpen(true);
    }, []);

    const openEdit = useCallback((cat: AdminCategoryDto) => {
        setEditingCategory(cat);
        setEditName(cat.name);
        setEditIcon(cat.icon ?? '');
        setError(null);
        setEditModalOpen(true);
    }, []);

    const closeAddModal = useCallback(() => {
        setAddModalOpen(false);
        setAddName('');
        setAddIcon('');
        setError(null);
    }, []);

    const closeEditModal = useCallback(() => {
        setEditModalOpen(false);
        setEditingCategory(null);
        setEditName('');
        setEditIcon('');
        setError(null);
    }, []);

    // 모달이 열릴 때만 초기값 동기화 (입력 중 리셋 방지)
    useEffect(() => {
        if (editModalOpen && editingCategory) {
            setEditName(editingCategory.name);
            setEditIcon(editingCategory.icon ?? '');
        }
    }, [editModalOpen, editingCategory?.id]);

    const handleAddSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            const trimmed = addName.trim();
            if (!trimmed || !categoryActions) {
                setError('카테고리 이름을 입력해 주세요.');
                return;
            }
            setSubmitting(true);
            setError(null);
            try {
                await categoryActions.createCategory(trimmed, addIcon.trim() || '');
                closeAddModal();
            } catch (err) {
                setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
            } finally {
                setSubmitting(false);
            }
        },
        [addName, addIcon, categoryActions, closeAddModal]
    );

    const handleEditSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            const trimmed = editName.trim();
            if (editingCategory == null || !trimmed || !categoryActions) {
                setError('카테고리 이름을 입력해 주세요.');
                return;
            }
            setSubmitting(true);
            setError(null);
            try {
                await categoryActions.updateCategory(editingCategory.id, trimmed, editIcon.trim() || '');
                closeEditModal();
            } catch (err) {
                setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
            } finally {
                setSubmitting(false);
            }
        },
        [editName, editIcon, editingCategory, categoryActions, closeEditModal]
    );

    const handleDelete = useCallback(
        async (cat: AdminCategoryDto) => {
            if (!categoryActions) return;
            if (!confirm(`"${cat.name}" 카테고리를 삭제할까요? 연결된 메뉴가 있으면 삭제할 수 없습니다.`)) return;
            try {
                await categoryActions.deleteCategory(cat.id);
                if (selectedCategory === cat.id) setSelectedCategory(null);
            } catch (err) {
                alert(err instanceof Error ? err.message : '삭제에 실패했습니다.');
            }
        },
        [categoryActions, selectedCategory, setSelectedCategory]
    );

    const handleAddIconFile = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file || !categoryActions?.uploadCategoryIcon) return;
            setUploadingIcon(true);
            try {
                const { url } = await categoryActions.uploadCategoryIcon(file);
                setAddIcon(url);
            } catch (err) {
                setError(err instanceof Error ? err.message : '아이콘 업로드에 실패했습니다.');
            } finally {
                setUploadingIcon(false);
                e.target.value = '';
            }
        },
        [categoryActions]
    );

    const handleEditIconFile = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file || !categoryActions?.uploadCategoryIcon) return;
            setUploadingIcon(true);
            try {
                const { url } = await categoryActions.uploadCategoryIcon(file);
                setEditIcon(url);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : '아이콘 업로드에 실패했습니다.');
            } finally {
                setUploadingIcon(false);
                e.target.value = '';
            }
        },
        [categoryActions]
    );

    /* ---------- DnD ---------- */
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id || !categoryActions?.reorderCategories || !adminCategories?.length) return;

            const oldIds = adminCategories.map((c) => c.id);
            const oldIndex = oldIds.indexOf(active.id as number);
            const newIndex = oldIds.indexOf(over.id as number);
            if (oldIndex === -1 || newIndex === -1) return;

            const newOrder = arrayMove(oldIds, oldIndex, newIndex);
            categoryActions.reorderCategories(newOrder);
        },
        [adminCategories, categoryActions]
    );

    const sortableIds = (adminCategories ?? []).map((c) => c.id);

    return (
        <>
            <nav className={styles.tabs}>
                <button
                    className={`${styles.tab} ${selectedCategory === null ? styles.active : ''}`}
                    onClick={() => setSelectedCategory(null)}
                >
                    <span>전체</span>
                    {totalCountDisplay > 0 && <span className={styles.count}>{totalCountDisplay}</span>}
                </button>

                {isAdminWithActions && categories.length > 0 ? (
                    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                        <SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
                            {categories.map((category) => (
                                <SortableCategoryTab
                                    key={category.id}
                                    category={category as AdminCategoryDto}
                                    menuCount={getMenuCount(category)}
                                    isActive={selectedCategory === category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    onEdit={(e) => {
                                        e.stopPropagation();
                                        openEdit(category as AdminCategoryDto);
                                    }}
                                    onDelete={(e) => {
                                        e.stopPropagation();
                                        handleDelete(category as AdminCategoryDto);
                                    }}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                ) : (
                    categories.map((category) => (
                        <button
                            key={category.id}
                            className={`${styles.tab} ${selectedCategory === category.id ? styles.active : ''}`}
                            onClick={() => setSelectedCategory(category.id)}
                        >
                            <span>{category.name}</span>
                            <span className={styles.count}>{getMenuCount(category)}</span>
                        </button>
                    ))
                )}

                {isAdminWithActions && (
                    <button
                        type="button"
                        className={styles.addCategoryBtn}
                        onClick={openAdd}
                        title="카테고리 추가"
                        aria-label="카테고리 추가"
                    >
                        +
                    </button>
                )}
            </nav>

            {/* Add category modal */}
            {addModalOpen && (
                <div className={styles.overlay} onClick={closeAddModal} role="presentation">
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog">
                        <h4 className={styles.modalTitle}>카테고리 추가</h4>
                        <form onSubmit={handleAddSubmit}>
                            <div className={styles.formRow}>
                                <label className={styles.label}>카테고리 이름</label>
                                <input
                                    type="text"
                                    className={styles.modalInput}
                                    value={addName}
                                    onChange={(e) => setAddName(e.target.value)}
                                    placeholder="예: 커피"
                                    autoFocus
                                    disabled={submitting}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <label className={styles.label}>아이콘 (이미지 업로드 또는 이모지/URL 입력)</label>
                                {categoryActions?.uploadCategoryIcon && (
                                    <div className={styles.iconUploadRow}>
                                        <input
                                            ref={addIconInputRef}
                                            type="file"
                                            accept="image/*"
                                            className={styles.fileInput}
                                            onChange={handleAddIconFile}
                                            disabled={submitting || uploadingIcon}
                                        />
                                        <button
                                            type="button"
                                            className={styles.uploadTriggerBtn}
                                            onClick={() => addIconInputRef.current?.click()}
                                            disabled={submitting || uploadingIcon}
                                        >
                                            {uploadingIcon ? '업로드 중…' : '이미지 선택'}
                                        </button>
                                    </div>
                                )}
                                <div className={styles.emojiQuickRow}>
                                    {EMOJI_QUICK.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            className={styles.emojiQuickBtn}
                                            onClick={() => setAddIcon((prev) => prev + emoji)}
                                            disabled={submitting}
                                            title={`${emoji} 넣기`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    className={styles.modalInput}
                                    value={addIcon}
                                    onChange={(e) => setAddIcon(e.target.value)}
                                    placeholder="예: ☕ 또는 업로드 후 URL 자동 입력"
                                    disabled={submitting}
                                />
                            </div>
                            {error && <p className={styles.formError}>{error}</p>}
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={closeAddModal} disabled={submitting}>
                                    취소
                                </button>
                                <button type="submit" className={styles.submitBtn} disabled={submitting || !addName.trim()}>
                                    {submitting ? '저장 중…' : '추가'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit category modal */}
            {editModalOpen && editingCategory != null && (
                <div className={styles.overlay} onClick={closeEditModal} role="presentation">
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog">
                        <h4 className={styles.modalTitle}>카테고리 수정</h4>
                        <form key={`edit-${editingCategory.id}`} onSubmit={handleEditSubmit}>
                            <div className={styles.formRow}>
                                <label className={styles.label}>카테고리 이름</label>
                                <input
                                    type="text"
                                    className={styles.modalInput}
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="예: 커피"
                                    autoFocus
                                    disabled={submitting}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <label className={styles.label}>아이콘 (이미지 업로드 또는 이모지/URL 입력)</label>
                                {categoryActions?.uploadCategoryIcon && (
                                    <div className={styles.iconUploadRow}>
                                        <input
                                            ref={editIconInputRef}
                                            type="file"
                                            accept="image/*"
                                            className={styles.fileInput}
                                            onChange={handleEditIconFile}
                                            disabled={submitting || uploadingIcon}
                                        />
                                        <button
                                            type="button"
                                            className={styles.uploadTriggerBtn}
                                            onClick={() => editIconInputRef.current?.click()}
                                            disabled={submitting || uploadingIcon}
                                        >
                                            {uploadingIcon ? '업로드 중…' : '이미지 선택'}
                                        </button>
                                    </div>
                                )}
                                <div className={styles.emojiQuickRow}>
                                    {EMOJI_QUICK.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            className={styles.emojiQuickBtn}
                                            onClick={() => setEditIcon((prev) => prev + emoji)}
                                            disabled={submitting}
                                            title={`${emoji} 넣기`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    className={styles.modalInput}
                                    value={editIcon}
                                    onChange={(e) => setEditIcon(e.target.value)}
                                    placeholder="예: ☕ 또는 업로드 후 URL 자동 입력"
                                    disabled={submitting}
                                />
                            </div>
                            {error && <p className={styles.formError}>{error}</p>}
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={closeEditModal} disabled={submitting}>
                                    취소
                                </button>
                                <button type="submit" className={styles.submitBtn} disabled={submitting || !editName.trim()}>
                                    {submitting ? '저장 중…' : '저장'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
