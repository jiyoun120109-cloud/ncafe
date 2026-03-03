import MenuDetailHeader from './_components/MenuDetailHeader/MenuDetailHeader';
import MenuDetailImages from './_components/MenuDetailImages/MenuDetailImages';
import MenuDetailInfo from './_components/MenuDetailInfo/MenuDetailInfo';
import MenuDetailOptions from './_components/MenuDetailOptions/MenuDetailOptions';
import styles from './page.module.css';

export default async function MenuDetailPage({ params }: { params: Promise<{ id: number }> }) {
    const id = (await params).id;

    return (
        <main className={styles.container}>
            <div className={styles.pageHeader}>
                <p className={styles.pageLabel}>Menu Detail</p>
                <h2 className={styles.pageTitle}>메뉴 상세</h2>
            </div>
            <div className={styles.divider} />
            <MenuDetailHeader id={id} />

            <div className={styles.content}>
                <MenuDetailImages menuId={id} />

                <div className={styles.rightColumn}>
                    <MenuDetailInfo id={id} />
                    <MenuDetailOptions id={id} />
                </div>
            </div>
        </main>
    );
}
