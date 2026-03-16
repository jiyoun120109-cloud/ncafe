import { Suspense } from 'react';
import MenuDetailHeader from './_components/MenuDetailHeader/MenuDetailHeader';
import MenuDetailImages from './_components/MenuDetailImages/MenuDetailImages';
import MenuDetailInfo from './_components/MenuDetailInfo/MenuDetailInfo';
import styles from './page.module.css';

interface PageProps {
    params: { id: string };
}

export default async function UserMenuDetailPage({ params }: PageProps) {
    const rawId = params.id;
    // URL 세그먼트에 "4:1" 같은 값이 들어와도 항상 숫자 ID만 사용
    const numericId = Number.parseInt(rawId, 10);
    const id = Number.isNaN(numericId) ? rawId : String(numericId);

    return (
        <main className={styles.container}>
            <div className={styles.pageHeader}>
                <p className={styles.pageLabel}>Menu Detail</p>
                <h2 className={styles.pageTitle}>메뉴 상세</h2>
            </div>
            <div className={styles.divider} />
            <MenuDetailHeader />
            <div className={styles.content}>
                <Suspense fallback={<div className={styles.loading}>이미지 로딩 중...</div>}>
                    <MenuDetailImages menuId={id} />
                </Suspense>
                <div className={styles.rightColumn}>
                    <MenuDetailInfo id={id} />
                </div>
            </div>
        </main>
    );
}
