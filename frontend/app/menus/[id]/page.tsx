import { Suspense } from 'react';
import { redirect, notFound } from 'next/navigation';
import MenuDetailHeader from './_components/MenuDetailHeader/MenuDetailHeader';
import MenuDetailImages from './_components/MenuDetailImages/MenuDetailImages';
import MenuDetailInfo from './_components/MenuDetailInfo/MenuDetailInfo';
import styles from './page.module.css';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function UserMenuDetailPage({ params }: PageProps) {
    const { id: rawId } = await params;
    const numericId = Number.parseInt(rawId, 10);

    if (Number.isNaN(numericId) || numericId <= 0) {
        notFound();
    }

    const id = String(numericId);

    if (rawId !== id) {
        redirect(`/menus/${id}`);
    }

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
