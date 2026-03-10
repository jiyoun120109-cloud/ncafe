'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import MenuForm from '../_components/MenuForm';
import { useCategories } from '../_components/CategoryTabs/useCategories';
import { useToast } from '@/hooks/useToast';
import { getApiBase } from '@/services/api';
import type { MenuCategory } from '@/types/menu';
import styles from './page.module.css';

export default function NewMenuPage() {
    const { setTitle } = useUIStore();
    const router = useRouter();
    const { categories: apiCategories } = useCategories();
    const { success, error } = useToast();

    const categories: MenuCategory[] = apiCategories.map((c) => ({
        id: c.id,
        korName: c.name,
        engName: '',
        icon: c.icon || '',
        sortOrder: c.sortOrder ?? 0,
        isActive: true,
    }));

    useEffect(() => {
        setTitle('새 메뉴 등록');
    }, [setTitle]);

    const handleSubmit = async (data: any) => {
        try {
            const res = await fetch(`${getApiBase()}/admin/menus/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    korName: data.korName,
                    engName: data.engName,
                    description: data.description ?? '',
                    price: Number(data.price) || 0,
                    categoryId: Number(data.category) || categories[0]?.id || 1,
                    isAvailable: !data.isSoldOut,
                    optionsJson: data.options?.length ? JSON.stringify(data.options) : undefined,
                    productInfoJson: data.productInfoJson ?? undefined,
                }),
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || '메뉴 등록에 실패했습니다.');
            }
            const result = await res.json();
            const menuId = result?.id;
            success('새로운 메뉴가 등록되었습니다.');
            if (menuId && data.imageFile) {
                const formData = new FormData();
                formData.append('file', data.imageFile);
                const imgRes = await fetch(`${getApiBase()}/admin/menus/${menuId}/images`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                });
                if (!imgRes.ok) {
                    success('메뉴는 등록되었습니다. 이미지 업로드에 실패했습니다.');
                }
            }
            router.push('/admin/menus');
        } catch (e) {
            error(e instanceof Error ? e.message : '메뉴 등록에 실패했습니다.');
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <main className={styles.container}>
            <div className={styles.pageHeader}>
                <p className={styles.pageLabel}>Menu Management</p>
                <h2 className={styles.pageTitle}>새 메뉴 등록</h2>
            </div>
            <div className={styles.divider} />
            <Link href="/admin/menus" className={styles.backBtn}>
                <ChevronLeft size={14} />
                <span>목록으로</span>
            </Link>
            <div className={styles.formCard}>
                <MenuForm
                    categories={categories}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </div>
        </main>
    );
}
