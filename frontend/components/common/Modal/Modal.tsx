'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../Button';
import styles from './Modal.module.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children?: ReactNode;
    // 확인용 속성들 (선택적)
    message?: string;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'primary' | 'danger';
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    message,
    onConfirm,
    confirmText = '확인',
    cancelText = '취소',
    variant = 'primary'
}: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{title}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className={styles.content}>
                    {/* message가 있으면 확인 모달 모드로 동작 */}
                    {message ? (
                        <div className={styles.confirmContent}>
                            <p className={styles.confirmMessage}>{message}</p>
                            <div className={styles.actions}>
                                <Button variant="outline" onClick={onClose}>
                                    {cancelText}
                                </Button>
                                <Button variant={variant} onClick={onConfirm}>
                                    {confirmText}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </div>
        </div>
    );
}
