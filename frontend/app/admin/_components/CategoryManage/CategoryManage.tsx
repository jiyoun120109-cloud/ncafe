'use client';

import { useState } from 'react';
import type { AdminCategoryDto } from '../useAdminCategories';
import styles from './CategoryManage.module.css';

interface CategoryManageProps {
    categories: AdminCategoryDto[];
    loading: boolean;
    onCreate: (name: string) => Promise<unknown>;
    onUpdate: (id: number, name: string) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

export default function CategoryManage({
    categories,
    loading,
    onCreate,
    onUpdate,
    onDelete,
}: CategoryManageProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [addName, setAddName] = useState('');
    const [editName, setEditName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const openEdit = (cat: AdminCategoryDto) => {
        setEditingId(cat.id);
        setEditName(cat.name);
        setError(null);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingId(null);
        setAddName('');
        setEditName('');
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
            await onCreate(trimmed);
            setAddName('');
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
            await onUpdate(editingId, trimmed);
            closeModal();
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

    return (
        <>
            <section className={styles.card}>
                <h3 className={styles.cardTitle}>카테고리 추가</h3>
                <p className={styles.hint}>
                    새 카테고리 이름을 입력한 뒤 추가 버튼을 누르면 목록에 반영됩니다.
                </p>
                <form onSubmit={handleAddSubmit}>
                    <div className={styles.formRow}>
                        <label className={styles.label} htmlFor="category-name">
                            카테고리 이름
                        </label>
                        <input
                            id="category-name"
                            type="text"
                            className={styles.input}
                            value={addName}
                            onChange={(e) => setAddName(e.target.value)}
                            placeholder="예: 커피"
                            disabled={submitting}
                        />
                    </div>
                    {error && !modalOpen && <p className={styles.formError}>{error}</p>}
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={submitting || !addName.trim()}
                    >
                        {submitting ? '저장 중…' : '카테고리 추가'}
                    </button>
                </form>
            </section>

            <section>
                <h3 className={styles.sectionTitle}>카테고리 목록</h3>
                {loading ? (
                    <div className={styles.loading}>불러오는 중…</div>
                ) : categories.length === 0 ? (
                    <div className={styles.empty}>등록된 카테고리가 없습니다. 위에서 카테고리를 추가해 보세요.</div>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>ID</th>
                                    <th className={styles.th}>이름</th>
                                    <th className={styles.th}>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat) => (
                                    <tr key={cat.id} className={styles.tr}>
                                        <td className={`${styles.td} ${styles.idCell}`}>{cat.id}</td>
                                        <td className={styles.td}>{cat.name}</td>
                                        <td className={styles.td}>
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

            {modalOpen && editingId != null && (
                <div className={styles.overlay} onClick={closeModal} role="presentation">
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
                            {error && <p className={styles.formError}>{error}</p>}
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={closeModal} disabled={submitting}>
                                    취소
                                </button>
                                <button type="submit" className={styles.submitBtn} disabled={submitting}>
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
