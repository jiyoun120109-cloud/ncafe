'use client';

import { useState, useRef } from 'react';
import type { AdminCategoryDto } from '../useAdminCategories';
import styles from './CategoryManage.module.css';

function isIconUrl(icon: string | null | undefined): boolean {
    if (!icon || !icon.trim()) return false;
    const t = icon.trim();
    return t.startsWith('http') || t.startsWith('/');
}

function getIconSrc(icon: string): string {
    const t = icon.trim();
    if (t.startsWith('http')) return t;
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return t.startsWith('/') ? base + t : base + '/' + t;
}

interface CategoryManageProps {
    categories: AdminCategoryDto[];
    loading: boolean;
    onCreate: (name: string, icon?: string | null, description?: string | null) => Promise<unknown>;
    onUpdate: (id: number, name: string, icon?: string | null, description?: string | null) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onUploadIcon?: (file: File) => Promise<{ url: string; filename: string }>;
}

export default function CategoryManage({
    categories,
    loading,
    onCreate,
    onUpdate,
    onDelete,
    onUploadIcon,
}: CategoryManageProps) {
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [addName, setAddName] = useState('');
    const [addIcon, setAddIcon] = useState('');
    const [addDescription, setAddDescription] = useState('');
    const [editName, setEditName] = useState('');
    const [editIcon, setEditIcon] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [uploadingIcon, setUploadingIcon] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const addIconInputRef = useRef<HTMLInputElement>(null);
    const editIconInputRef = useRef<HTMLInputElement>(null);

    const openAdd = () => {
        setAddName('');
        setAddIcon('');
        setAddDescription('');
        setError(null);
        setAddModalOpen(true);
    };

    const openEdit = (cat: AdminCategoryDto) => {
        setEditingId(cat.id);
        setEditName(cat.name);
        setEditIcon(cat.icon ?? '');
        setEditDescription(cat.description ?? '');
        setError(null);
        setEditModalOpen(true);
    };

    const closeAddModal = () => {
        setAddModalOpen(false);
        setAddName('');
        setAddIcon('');
        setAddDescription('');
        setError(null);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setEditingId(null);
        setEditName('');
        setEditIcon('');
        setEditDescription('');
        setError(null);
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = addName.trim();
        if (!trimmed) {
            setError('카테고리 이름을 입력해 주세요.');
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            await onCreate(trimmed, addIcon.trim() || null, addDescription.trim() || null);
            closeAddModal();
        } catch (err) {
            setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = editName.trim();
        if (editingId == null || !trimmed) {
            setError('카테고리 이름을 입력해 주세요.');
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            await onUpdate(editingId, trimmed, editIcon.trim() || null, editDescription.trim() || null);
            closeEditModal();
        } catch (err) {
            setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number, catName: string) => {
        if (!confirm(`"${catName}" 카테고리를 삭제할까요? 연결된 메뉴가 있으면 삭제할 수 없습니다.`)) return;
        try {
            await onDelete(id);
        } catch (err) {
            alert(err instanceof Error ? err.message : '삭제에 실패했습니다.');
        }
    };

    const handleAddIconFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onUploadIcon) return;
        setUploadingIcon(true);
        try {
            const { url } = await onUploadIcon(file);
            setAddIcon(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : '아이콘 업로드에 실패했습니다.');
        } finally {
            setUploadingIcon(false);
            e.target.value = '';
        }
    };

    const handleEditIconFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onUploadIcon) return;
        setUploadingIcon(true);
        try {
            const { url } = await onUploadIcon(file);
            setEditIcon(url);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : '아이콘 업로드에 실패했습니다.');
        } finally {
            setUploadingIcon(false);
            e.target.value = '';
        }
    };

    return (
        <>
            <section>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>카테고리 목록</h3>
                    <button type="button" className={styles.addBtn} onClick={openAdd}>
                        카테고리 추가
                    </button>
                </div>
                {loading ? (
                    <div className={styles.loading}>불러오는 중…</div>
                ) : categories.length === 0 ? (
                    <div className={styles.empty}>등록된 카테고리가 없습니다. 카테고리 추가 버튼으로 추가해 보세요.</div>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <colgroup>
                                <col className={styles.colOrder} />
                                <col className={styles.colIcon} />
                                <col className={styles.colName} />
                                <col className={styles.colDesc} />
                                <col className={styles.colActions} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th className={styles.th}>순서</th>
                                    <th className={styles.th}>아이콘</th>
                                    <th className={styles.th}>이름</th>
                                    <th className={styles.th}>설명</th>
                                    <th className={`${styles.th} ${styles.thActions}`}>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat) => (
                                    <tr key={cat.id} className={styles.tr}>
                                        <td className={`${styles.td} ${styles.orderCell}`}>{cat.id}</td>
                                        <td className={styles.td}>
                                            {cat.icon && isIconUrl(cat.icon) ? (
                                                <img
                                                    src={getIconSrc(cat.icon)}
                                                    alt=""
                                                    className={styles.iconImg}
                                                />
                                            ) : (
                                                <span className={styles.iconCell}>{cat.icon?.trim() || '—'}</span>
                                            )}
                                        </td>
                                        <td className={styles.td}>
                                            <span className={styles.nameCell}>{cat.name}</span>
                                        </td>
                                        <td className={styles.td}>
                                            <span className={styles.descCell} title={cat.description ?? undefined}>
                                                {cat.description?.trim() || '—'}
                                            </span>
                                        </td>
                                        <td className={`${styles.td} ${styles.actionsCell}`}>
                                            <div className={styles.actions}>
                                                <button
                                                    type="button"
                                                    className={styles.actionBtn}
                                                    onClick={() => openEdit(cat)}
                                                    title="수정"
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                                                    onClick={() => handleDelete(cat.id, cat.name)}
                                                    title="삭제"
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {addModalOpen && (
                <div className={styles.overlay} onClick={closeAddModal} role="presentation">
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog">
                        <h4 className={styles.modalTitle}>카테고리 추가</h4>
                        <form onSubmit={handleAddSubmit}>
                            <div className={styles.formRow}>
                                <label className={styles.label}>카테고리 이름</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={addName}
                                    onChange={(e) => setAddName(e.target.value)}
                                    placeholder="예: 커피"
                                    autoFocus
                                    disabled={submitting}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <label className={styles.label}>아이콘 (이미지 업로드 또는 이모지/URL 입력)</label>
                                {onUploadIcon && (
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
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={addIcon}
                                    onChange={(e) => setAddIcon(e.target.value)}
                                    placeholder="예: ☕ 또는 업로드 후 URL 자동 입력"
                                    disabled={submitting}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <label className={styles.label}>설명 (목록에 표시)</label>
                                <textarea
                                    className={styles.textarea}
                                    value={addDescription}
                                    onChange={(e) => setAddDescription(e.target.value)}
                                    placeholder="예: 에스프레소 기반 음료"
                                    rows={2}
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

            {editModalOpen && editingId != null && (
                <div className={styles.overlay} onClick={closeEditModal} role="presentation">
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog">
                        <h4 className={styles.modalTitle}>카테고리 수정</h4>
                        <form onSubmit={handleEditSubmit}>
                            <div className={styles.formRow}>
                                <label className={styles.label}>카테고리 이름</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="예: 커피"
                                    autoFocus
                                    disabled={submitting}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <label className={styles.label}>아이콘 (이미지 업로드 또는 이모지/URL 입력)</label>
                                {onUploadIcon && (
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
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={editIcon}
                                    onChange={(e) => setEditIcon(e.target.value)}
                                    placeholder="예: ☕ 또는 업로드 후 URL 자동 입력"
                                    disabled={submitting}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <label className={styles.label}>설명 (목록에 표시)</label>
                                <textarea
                                    className={styles.textarea}
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="예: 에스프레소 기반 음료"
                                    rows={2}
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
