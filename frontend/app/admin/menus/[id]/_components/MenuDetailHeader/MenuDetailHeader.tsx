import Link from 'next/link';
import { ChevronLeft, Edit2, Trash2 } from 'lucide-react';
import styles from './MenuDetailHeader.module.css';

export default function MenuDetailHeader({ id }: { id: number }) {
    return (
        <div className={styles.header}>
            <Link href="/admin/menus" className={styles.backBtn}>
                <ChevronLeft size={20} />
                <span>목록으로</span>
            </Link>
            <div className={styles.actions}>
                <Link href={`/admin/menus/${id}/edit`} className={styles.editBtn}>
                    <Edit2 size={18} />
                    <span>수정</span>
                </Link>
                <button className={styles.deleteBtn}>
                    <Trash2 size={18} />
                    <span>삭제</span>
                </button>
            </div>
        </div>
    );
}
