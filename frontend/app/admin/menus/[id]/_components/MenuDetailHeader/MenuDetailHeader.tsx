'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Edit2, Trash2 } from 'lucide-react';
import DeleteConfirmModal from '@/app/admin/_components/DeleteConfirmModal/DeleteConfirmModal';
import styles from './MenuDetailHeader.module.css';
import { getApiBase } from '@/services/api';

export default function MenuDetailHeader({ id }: { id: number }) {
    const router = useRouter();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const handleDeleteConfirm = async () => {
        try {
            const res = await fetch(`${getApiBase()}/admin/menus/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('삭제에 실패했습니다.');
            router.push('/admin/menus');
        } catch (err) {
            console.error(err);
            alert(err instanceof Error ? err.message : '삭제에 실패했습니다.');
            throw err;
        }
    };

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
                <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => setDeleteModalOpen(true)}
                >
                    <Trash2 size={18} />
                    <span>삭제</span>
                </button>
            </div>

            <DeleteConfirmModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="메뉴 삭제"
                message="이 메뉴를 삭제할까요? 이 작업은 되돌릴 수 없습니다."
            />
        </div>
    );
}
