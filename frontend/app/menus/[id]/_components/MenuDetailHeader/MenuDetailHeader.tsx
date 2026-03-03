import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import styles from './MenuDetailHeader.module.css';

export default function MenuDetailHeader() {
    return (
        <div className={styles.header}>
            <Link href="/menus" className={styles.backBtn}>
                <ChevronLeft size={20} aria-hidden />
                <span>목록으로</span>
            </Link>
        </div>
    );
}
