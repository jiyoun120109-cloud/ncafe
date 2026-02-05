'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import MenuForm from '../../_components/MenuForm';
import { useMenuStore } from '@/stores/menuStore';
import { useToast } from '@/hooks/useToast';
import { mockCategories } from '@/mocks/menuData';
import { Menu } from '@/types/menu';
import styles from './page.module.css';

export default function EditMenuPage() {
    const params = useParams();
    const router = useRouter();
    const { setTitle } = useUIStore();
    const { menus, updateMenu } = useMenuStore();
    const { success } = useToast();
    const [menu, setMenu] = useState<Menu | null>(null);

    const id = params?.id as string;

    useEffect(() => {
        const foundMenu = menus.find(m => m.id === id);
        if (foundMenu) {
            setMenu(foundMenu);
            setTitle(`${foundMenu.korName} 수정`);
        } else {
            setTitle('메뉴를 찾을 수 없음');
        }
    }, [id, setTitle, menus]);

    const handleSubmit = (data: any) => {
        updateMenu(id, data);
        success('메뉴 정보가 성공적으로 수정되었습니다! 🖋️');
        router.push(`/admin/menus/${id}`);
    };

    const handleCancel = () => {
        router.back();
    };

    if (!menu) {
        return <div className={styles.loading}>정보를 불러오는 중...</div>;
    }

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <Link href={`/admin/menus/${id}`} className={styles.backBtn}>
                    <ChevronLeft size={18} />
                    <span>상세 페이지로 돌아가기</span>
                </Link>
            </div>

            <div className={styles.formCard}>
                <MenuForm
                    initialData={menu}
                    categories={mockCategories}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </div>
        </main>
    );
}
