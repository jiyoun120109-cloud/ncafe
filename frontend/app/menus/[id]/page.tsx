import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import MenuDetailImages from './_components/MenuDetailImages/MenuDetailImages';
import MenuDetailInfo from './_components/MenuDetailInfo/MenuDetailInfo';
import styles from './page.module.css';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function UserMenuDetailPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <main className={styles.container}>
            <div className={styles.pageHeader}>
                <p className={styles.pageLabel}>Menu Detail</p>
                <h2 className={styles.pageTitle}>메뉴 상세</h2>
            </div>
            <div className={styles.divider} />
            <Link href="/menus" className={styles.backBtn}>
                <ChevronLeft size={14} />
                <span>목록으로</span>
            </Link>
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
