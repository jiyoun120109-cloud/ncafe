'use client';

import styles from './MenuDetailOptions.module.css';

export default function MenuDetailOptions({ id }: { id: number }) {
    return (
        <section className={styles.optionSection}>
            <div className={styles.header}>
                <h2 className={styles.sectionTitle}>옵션 설정</h2>
            </div>
        </section>
    );
}
