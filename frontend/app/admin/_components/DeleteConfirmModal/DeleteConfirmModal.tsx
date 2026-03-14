'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trash2 } from 'lucide-react';
import styles from './DeleteConfirmModal.module.css';

export interface DeleteConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
}

export default function DeleteConfirmModal({
    open,
    onClose,
    onConfirm,
    title = '삭제',
    message = '정말 삭제할까요? 이 작업은 되돌릴 수 없습니다.',
    confirmLabel = '삭제',
    cancelLabel = '취소',
}: DeleteConfirmModalProps) {
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!open) return;
        const onEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onEscape);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onEscape);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch {
            /* 부모에서 에러 처리; 모달 유지 */
        } finally {
            setLoading(false);
        }
    };

    const modalContent = (
        <div
            className={styles.backdrop}
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-desc"
        >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.content}>
                    <div className={styles.iconWrap} aria-hidden>
                        <Trash2 size={28} strokeWidth={1.8} />
                    </div>
                    <h2 id="delete-modal-title" className={styles.title}>
                        {title}
                    </h2>
                    <p id="delete-modal-desc" className={styles.message}>
                        {message}
                    </p>
                </div>
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.btnCancel}
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        className={styles.btnConfirm}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? '처리 중…' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );

    if (!open) return null;

    return typeof document !== 'undefined'
        ? createPortal(modalContent, document.body)
        : null;
}
