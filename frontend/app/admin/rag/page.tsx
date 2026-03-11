'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUIStore } from '@/stores/uiStore';
import {
    fetchRagDocuments,
    createRagDocument,
    updateRagDocument,
    deleteRagDocument,
    type RagDocument,
    type RagDocumentCreate,
} from '@/services/ragService';
import styles from './page.module.css';

function formatDate(iso: string): string {
    try {
        const d = new Date(iso);
        return d.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
}

export default function AdminRagPage() {
    const { setTitle } = useUIStore();
    const [documents, setDocuments] = useState<RagDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [title, setTitleInput] = useState('');
    const [content, setContent] = useState('');
    const [editing, setEditing] = useState<RagDocument | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editSaving, setEditSaving] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const loadDocuments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await fetchRagDocuments();
            setDocuments(list);
        } catch (e) {
            setError(e instanceof Error ? e.message : '문서 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setTitle('RAG 관리');
    }, [setTitle]);

    useEffect(() => {
        loadDocuments();
    }, [loadDocuments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = content.trim();
        if (!text) {
            setError('내용을 입력해 주세요.');
            return;
        }
        setSubmitLoading(true);
        setError(null);
        try {
            const payload: RagDocumentCreate = {
                title: title.trim() || undefined,
                content: text,
            };
            await createRagDocument(payload);
            setTitleInput('');
            setContent('');
            await loadDocuments();
        } catch (e) {
            setError(e instanceof Error ? e.message : '문서 등록에 실패했습니다.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const openEdit = (doc: RagDocument) => {
        setEditing(doc);
        setEditTitle(doc.title ?? '');
        setEditContent(doc.content);
    };

    const closeEdit = () => {
        setEditing(null);
        setEditTitle('');
        setEditContent('');
        setEditSaving(false);
    };

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        setEditSaving(true);
        setError(null);
        try {
            await updateRagDocument(editing.id, {
                title: editTitle.trim() || undefined,
                content: editContent.trim(),
            });
            closeEdit();
            await loadDocuments();
        } catch (e) {
            setError(e instanceof Error ? e.message : '수정에 실패했습니다.');
        } finally {
            setEditSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        setError(null);
        try {
            await deleteRagDocument(id);
            setDeleteConfirmId(null);
            await loadDocuments();
        } catch (e) {
            setError(e instanceof Error ? e.message : '삭제에 실패했습니다.');
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <p className={styles.pageLabel}>RAG</p>
                <h2 className={styles.pageTitle}>RAG 관리</h2>
            </div>
            <div className={styles.divider} />

            {/* 문서 추가 */}
            <section className={styles.card}>
                <h3 className={styles.cardTitle}>문서 추가</h3>
                <p className={styles.hint}>
                    순수 텍스트를 입력하면 서버에서 임베딩 후 DB(pgvector)에 저장됩니다.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formRow}>
                        <label className={styles.label} htmlFor="rag-title">
                            제목 (선택)
                        </label>
                        <input
                            id="rag-title"
                            type="text"
                            className={styles.input}
                            value={title}
                            onChange={(e) => setTitleInput(e.target.value)}
                            placeholder="예: 이용 안내"
                        />
                    </div>
                    <div className={styles.formRow}>
                        <label className={styles.label} htmlFor="rag-content">
                            내용 *
                        </label>
                        <textarea
                            id="rag-content"
                            className={styles.textarea}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="저장할 텍스트를 입력하세요."
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={submitLoading || !content.trim()}
                    >
                        {submitLoading ? '저장 중…' : '문서 전송 및 임베딩 저장'}
                    </button>
                </form>
            </section>

            {/* 저장된 문서 목록 */}
            <section>
                <h3 className={styles.sectionTitle}>저장된 문서 (DB)</h3>
                {error && <div className={styles.error}>{error}</div>}
                {loading ? (
                    <div className={styles.loading}>목록을 불러오는 중…</div>
                ) : documents.length === 0 ? (
                    <div className={styles.emptyList}>저장된 문서가 없습니다. 위에서 문서를 추가해 보세요.</div>
                ) : (
                    <>
                        {/* 데스크톱: 테이블 */}
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.th}>ID</th>
                                        <th className={styles.th}>제목</th>
                                        <th className={styles.th}>내용 미리보기</th>
                                        <th className={styles.th}>저장일시</th>
                                        <th className={styles.th}>관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc) => (
                                        <tr key={doc.id} className={styles.tr}>
                                            <td className={`${styles.td} ${styles.idCell}`}>{doc.id}</td>
                                            <td className={styles.td}>{doc.title || '—'}</td>
                                            <td className={styles.td}>
                                                <span className={styles.contentPreview}>
                                                    {doc.content || '—'}
                                                </span>
                                            </td>
                                            <td className={`${styles.td} ${styles.dateCell}`}>
                                                {formatDate(doc.createdAt)}
                                            </td>
                                            <td className={styles.td}>
                                                <div className={styles.actions}>
                                                    <button
                                                        type="button"
                                                        className={styles.actionBtn}
                                                        onClick={() => openEdit(doc)}
                                                    >
                                                        수정
                                                    </button>
                                                    {deleteConfirmId === doc.id ? (
                                                        <>
                                                            <span className={styles.dateCell}>삭제할까요?</span>
                                                            <button
                                                                type="button"
                                                                className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                                                                onClick={() => handleDelete(doc.id)}
                                                            >
                                                                예
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={styles.actionBtn}
                                                                onClick={() => setDeleteConfirmId(null)}
                                                            >
                                                                아니오
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                                                            onClick={() => setDeleteConfirmId(doc.id)}
                                                        >
                                                            삭제
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* 모바일: 카드 목록 */}
                        <div className={styles.cardList}>
                            {documents.map((doc) => (
                                <div key={doc.id} className={styles.cardItem}>
                                    <div className={styles.cardItemHeader}>
                                        <span className={styles.cardItemId}>ID {doc.id}</span>
                                        <span className={styles.cardItemTitle}>{doc.title || '—'}</span>
                                    </div>
                                    <div className={styles.cardItemPreview}>
                                        {doc.content || '—'}
                                    </div>
                                    <div className={styles.cardItemMeta}>
                                        {formatDate(doc.createdAt)}
                                    </div>
                                    <div className={styles.cardItemActions}>
                                        <button
                                            type="button"
                                            className={styles.actionBtn}
                                            onClick={() => openEdit(doc)}
                                        >
                                            수정
                                        </button>
                                        {deleteConfirmId === doc.id ? (
                                            <>
                                                <span className={styles.dateCell}>삭제할까요?</span>
                                                <button
                                                    type="button"
                                                    className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                                                    onClick={() => handleDelete(doc.id)}
                                                >
                                                    예
                                                </button>
                                                <button
                                                    type="button"
                                                    className={styles.actionBtn}
                                                    onClick={() => setDeleteConfirmId(null)}
                                                >
                                                    아니오
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                type="button"
                                                className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                                                onClick={() => setDeleteConfirmId(doc.id)}
                                            >
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </section>

            {/* 수정 모달 */}
            {editing && (
                <div
                    className={styles.overlay}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="edit-modal-title"
                    onClick={(e) => e.target === e.currentTarget && closeEdit()}
                >
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 id="edit-modal-title" className={styles.modalTitle}>
                            문서 수정 (ID: {editing.id})
                        </h3>
                        <form onSubmit={handleEditSave}>
                            <div className={styles.formRow}>
                                <label className={styles.label} htmlFor="edit-title">
                                    제목 (선택)
                                </label>
                                <input
                                    id="edit-title"
                                    type="text"
                                    className={styles.input}
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    placeholder="제목"
                                />
                            </div>
                            <div className={styles.formRow}>
                                <label className={styles.label} htmlFor="edit-content">
                                    내용 *
                                </label>
                                <textarea
                                    id="edit-content"
                                    className={styles.textarea}
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={editSaving}
                                >
                                    {editSaving ? '저장 중…' : '저장'}
                                </button>
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={closeEdit}
                                >
                                    취소
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
