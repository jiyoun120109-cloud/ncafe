'use client';

import { useState, useEffect } from 'react';
import type { CartItemDto, CartItemOptions } from '@/services/cartService';
import styles from './CartItemOptionModal.module.css';

const BEAN_OPTIONS = [
    { value: '', label: '기본 원두' },
    { value: '에티오피아', label: '에티오피아' },
    { value: '콜롬비아', label: '콜롬비아' },
    { value: '케냐', label: '케냐' },
    { value: '브라질', label: '브라질' },
];

export interface CartItemOptionModalProps {
    open: boolean;
    onClose: () => void;
    item: CartItemDto | null;
    onConfirm: (cartItemId: number, options: CartItemOptions) => Promise<void>;
}

export default function CartItemOptionModal({
    open,
    onClose,
    item,
    onConfirm,
}: CartItemOptionModalProps) {
    const [temperature, setTemperature] = useState<'HOT' | 'ICED'>('HOT');
    const [beanOption, setBeanOption] = useState('');
    const [decaf, setDecaf] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!item) return;
        setTemperature((item.temperature === 'ICED' ? 'ICED' : 'HOT') as 'HOT' | 'ICED');
        setBeanOption(item.beanOption ?? '');
        setDecaf(!!item.decaf);
    }, [item, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!item) return;
        setSubmitting(true);
        try {
            await onConfirm(item.id, {
                temperature,
                beanOption: beanOption || undefined,
                decaf,
            });
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div
            className={styles.backdrop}
            onClick={(e) => e.target === e.currentTarget && onClose()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="option-modal-title"
        >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 id="option-modal-title" className={styles.title}>
                    옵션 변경 {item && `- ${item.menuKorName}`}
                </h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label className={styles.label}>온도</label>
                        <div className={styles.tempRow}>
                            <button
                                type="button"
                                className={temperature === 'HOT' ? styles.tempActive : styles.tempBtn}
                                onClick={() => setTemperature('HOT')}
                            >
                                HOT
                            </button>
                            <button
                                type="button"
                                className={temperature === 'ICED' ? styles.tempActive : styles.tempBtn}
                                onClick={() => setTemperature('ICED')}
                            >
                                ICED
                            </button>
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>원두 선택</label>
                        <select
                            className={styles.select}
                            value={beanOption}
                            onChange={(e) => setBeanOption(e.target.value)}
                        >
                            {BEAN_OPTIONS.map((opt) => (
                                <option key={opt.value || 'default'} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.field}>
                        <label className={styles.checkLabel}>
                            <input
                                type="checkbox"
                                checked={decaf}
                                onChange={(e) => setDecaf(e.target.checked)}
                                className={styles.checkbox}
                            />
                            디카페인 (+300원)
                        </label>
                    </div>
                    <div className={styles.actions}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            취소
                        </button>
                        <button type="submit" className={styles.confirmBtn} disabled={submitting}>
                            {submitting ? '변경 중...' : '적용'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
