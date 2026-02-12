'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import MenuForm from '../_components/MenuForm';
import { mockCategories } from '@/mocks/menuData';
import { useMenuStore } from '@/stores/menuStore';
import { useToast } from '@/hooks/useToast';
import styles from './page.module.css';

export default function NewMenuPage() {
    const { setTitle } = useUIStore();
    const router = useRouter();
    const { addMenu } = useMenuStore();
    const { success } = useToast();

    useEffect(() => {
        setTitle('새 메뉴 등록');
    }, [setTitle]);

    const handleSubmit = (data: any) => {
        const newMenu = {
            ...data,
            id: Date.now(),
            images: [], // 임시
            isAvailable: true,
            sortOrder: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        addMenu(newMenu);
        success('새로운 메뉴가 성실하게 등록되었습니다! ✨');
        router.push('/admin/menus');
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <Link href="/admin/menus" className={styles.backBtn}>
                    <ChevronLeft size={18} />
                    <span>목록으로 돌아가기</span>
                </Link>
            </div>

            <div className={styles.formCard}>
                <MenuForm
                    categories={mockCategories}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </div>
        </main>
    );
}
