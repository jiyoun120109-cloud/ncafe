import styles from './MenuSkeleton.module.css';

export default function MenuSkeleton() {
    return (
        <div className={styles.skeletonCard}>
            <div className={styles.imageSkeleton} />
            <div className={styles.contentSkeleton}>
                <div className={styles.categorySkeleton} />
                <div className={styles.nameSkeleton} />
                <div className={styles.priceSkeleton} />
                <div className={styles.descSkeleton} />
                <div className={styles.footerSkeleton}>
                    <div className={styles.toggleSkeleton} />
                    <div className={styles.btnsSkeleton} />
                </div>
            </div>
        </div>
    );
}
