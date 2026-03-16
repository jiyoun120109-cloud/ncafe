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
            const rawCategory = data.category != null && data.category !== '' ? Number(data.category) : NaN;
            const categoryId = Number.isFinite(rawCategory) ? rawCategory : (categories[0]?.id ?? 1);
            const priceVal = Number(data.price);
            const price = Number.isFinite(priceVal) && priceVal >= 0 ? priceVal : 0;

            const num = (v: unknown): number | null => {
                if (v == null || v === '') return null;
                const n = Number(v);
                return Number.isFinite(n) ? n : null;
            };

            const body: Record<string, unknown> = {
                korName: typeof data.korName === 'string' ? data.korName : '',
                engName: typeof data.engName === 'string' ? data.engName : '',
                description: typeof data.description === 'string' ? data.description : '',
                price,
                categoryId: categoryId,
                isAvailable: Boolean(!data.isSoldOut),
                isPopular: Boolean(data.isPopular),
                isNew: Boolean(data.isNew),
                isRecommended: Boolean(data.isRecommended),
                displayPriority: num(data.displayPriority) ?? 0,
            };
            if (data.optionsJson != null && data.optionsJson !== '') body.optionsJson = data.optionsJson;
            else if (Array.isArray(data.options) && data.options.length > 0) {
                body.optionsJson = JSON.stringify(data.options.map((o: { name?: string; type?: string; required?: boolean; items?: { name?: string; priceDelta?: number }[] }) => ({
                    name: o.name ?? '',
                    type: o.type === 'checkbox' ? 'checkbox' : 'radio',
                    required: Boolean(o.required),
                    items: (o.items ?? []).map((it: { name?: string; priceDelta?: number }) => ({ name: it.name ?? '', priceDelta: Number(it.priceDelta) || 0 })),
                })));
            }
            if (data.productInfoJson != null && data.productInfoJson !== '') body.productInfoJson = data.productInfoJson;

            const res = await fetch(`${getApiBase()}/admin/menus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const errText = await res.text();
                let message = '메뉴 등록에 실패했습니다.';
                try {
                    const errJson = JSON.parse(errText);
                    if (errJson.message) message = errJson.message;
                    else if (errJson.error) message = errJson.error;
                } catch {
                    if (errText.trim()) message = errText;
                }
                throw new Error(message);
            }
            const result = await res.json();
            const menuId = result?.id;
            success('새로운 메뉴가 등록되었습니다.');
            if (menuId && Array.isArray(data.imageFiles) && data.imageFiles.length > 0) {
                for (const file of data.imageFiles) {
                    const formData = new FormData();
                    formData.append('file', file);
                    const imgRes = await fetch(`${getApiBase()}/admin/menus/${menuId}/images`, {
                        method: 'POST',
                        credentials: 'include',
                        body: formData,
                    });
                    if (!imgRes.ok) {
                        success('메뉴는 등록되었습니다. 일부 이미지 업로드에 실패했습니다.');
                        break;
                    }
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
            <div className={styles.pageInner}>
                <div className={styles.pageHeader}>
                    <p className={styles.pageLabel}>Menu Management</p>
                    <h2 className={styles.pageTitle}>새 메뉴 등록</h2>
                </div>
                <Link href="/admin/menus" className={styles.backBtn}>
                    <ChevronLeft size={14} />
                    <span>목록으로</span>
                </Link>
                <div className={styles.divider} />
                <div className={styles.formCard}>
                    <MenuForm
                        categories={categories}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    />
                </div>
            </div>
        </main>
    );
}
