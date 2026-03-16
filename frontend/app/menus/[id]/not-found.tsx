import Link from 'next/link';
import styles from './page.module.css';

export default function MenuNotFound() {
    return (
        <main className={styles.container}>
            <div className={styles.pageHeader}>
                <p className={styles.pageLabel}>Menu Not Found</p>
                <h2 className={styles.pageTitle}>존재하지 않는 메뉴</h2>
            </div>
            <div className={styles.divider} />
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <p style={{ fontSize: '1.125rem', marginBottom: '1.5rem', color: '#666' }}>
                    요청하신 메뉴를 찾을 수 없습니다.
                </p>
                <Link
                    href="/menus"
                    style={{
                        display: 'inline-block',
                        padding: '0.75rem 2rem',
                        background: '#2d6b4a',
                        color: '#fff',
                        borderRadius: '0.5rem',
                        textDecoration: 'none',
                        fontWeight: 600,
                    }}
                >
                    메뉴 목록으로 돌아가기
                </Link>
            </div>
        </main>
    );
}
