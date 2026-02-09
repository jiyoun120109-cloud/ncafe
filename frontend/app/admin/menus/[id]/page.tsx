import { use } from 'react';
import MenuDetailHeader from './_components/MenuDetailHeader/MenuDetailHeader';
import MenuDetailImages from './_components/MenuDetailImages/MenuDetailImages';
import MenuDetailInfo from './_components/MenuDetailInfo/MenuDetailInfo';
import MenuDetailOptions from './_components/MenuDetailOptions/MenuDetailOptions';
import styles from './page.module.css';



export default async function MenuDetailPage({ params }: { params: Promise<{ id: number }> }) {
    const id = (await params).id;


    return (
        <main className={styles.container}>
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
