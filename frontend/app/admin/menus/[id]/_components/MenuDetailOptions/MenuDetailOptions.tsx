'use client';

import { useMemo } from 'react';
import styles from './MenuDetailOptions.module.css';
import { useMenuDetail } from '../MenuDetailInfo/useMenuDetail';

interface OptionRow {
    name?: string;
    type?: string;
    required?: boolean;
}

export default function MenuDetailOptions({ id }: { id: number }) {
    const { menu, loading, error } = useMenuDetail(id);

    const options = useMemo((): OptionRow[] => {
        if (!menu?.optionsJson?.trim()) return [];
        try {
            const parsed = JSON.parse(menu.optionsJson) as unknown;
            return Array.isArray(parsed) ? (parsed as OptionRow[]) : [];
        } catch {
            return [];
        }
    }, [menu?.optionsJson]);

    if (loading) {
        return (
            <section className={styles.optionSection}>
                <div className={styles.header}>
                    <h2 className={styles.sectionTitle}>옵션 설정</h2>
                </div>
                <p className={styles.emptyText}>로딩 중...</p>
            </section>
        );
    }

    if (error || !menu) {
        return (
            <section className={styles.optionSection}>
                <div className={styles.header}>
                    <h2 className={styles.sectionTitle}>옵션 설정</h2>
                </div>
                <p className={styles.emptyText}>메뉴 정보를 불러올 수 없습니다.</p>
            </section>
        );
    }

    return (
        <section className={styles.optionSection}>
            <div className={styles.header}>
                <h2 className={styles.sectionTitle}>옵션 설정</h2>
            </div>
            {options.length > 0 ? (
                <div className={styles.optionList}>
                    {options.map((opt, index) => (
                        <div key={index} className={styles.optionItem}>
                            <div className={styles.optionHeader}>
                                <span className={styles.optionName}>{opt.name || '(이름 없음)'}</span>
                                <span className={styles.optionType}>
                                    {opt.type === 'checkbox' ? '다중 선택' : '단일 선택'}
                                    {opt.required ? ' · 필수' : ''}
                                </span>
                            </div>
                            <div className={styles.optionValues}>
                                <span className={styles.optionValue}>옵션 항목은 등록/수정 페이지에서 관리</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className={styles.emptyText}>등록된 옵션이 없습니다. 메뉴 수정에서 옵션을 추가할 수 있습니다.</p>
            )}
        </section>
    );
}
