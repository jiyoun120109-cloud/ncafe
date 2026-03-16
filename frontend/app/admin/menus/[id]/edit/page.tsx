'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import MenuForm from '../../_components/MenuForm';
import { useCategories } from '../../_components/CategoryTabs/useCategories';
import { useToast } from '@/hooks/useToast';
import { getApiBase } from '@/services/api';
import type { MenuCategory, Menu, MenuOption, ProductInfo } from '@/types/menu';
import styles from './page.module.css';

interface MenuDetailApiResponse {
    id: number;
    korName: string;
    engName: string;
    description: string;
    price: number;
    categoryId: number;
    categoryName: string;
    isAvailable: boolean;
    optionsJson: string | null;
    productInfoJson: string | null;
    isPopular: boolean | null;
    isNew: boolean | null;
    isRecommended: boolean | null;
    displayPriority: number | null;
    likeCount: number | null;
    viewCount: number | null;
    createdAt: string;
    updatedAt: string;
}

function apiResponseToInitialData(res: MenuDetailApiResponse): Partial<Menu> & Record<string, unknown> {
    let options: MenuOption[] = [];
    if (res.optionsJson?.trim()) {
        try {
            const parsed = JSON.parse(res.optionsJson) as { name?: string; type?: string; required?: boolean; items?: { name?: string; priceDelta?: number }[] }[];
            options = Array.isArray(parsed)
                ? parsed.map((o, i) => ({
                      id: i,
                      name: o.name ?? '',
                      type: (o.type === 'checkbox' ? 'checkbox' : 'radio') as MenuOption['type'],
                      required: Boolean(o.required),
                      items: Array.isArray(o.items)
                          ? o.items.map((it, j) => ({ id: j, name: it.name ?? '', priceDelta: Number(it.priceDelta) || 0 }))
                          : [],
                  }))
                : [];
        } catch {
            options = [];
        }
    }
    let productInfo: ProductInfo | undefined;
    if (res.productInfoJson?.trim()) {
        try {
            productInfo = JSON.parse(res.productInfoJson) as ProductInfo;
        } catch {
            productInfo = undefined;
        }
    }
    return {
        id: res.id,
        korName: res.korName,
        engName: res.engName,
        description: res.description ?? '',
        price: res.price,
        category: res.categoryId ?? 0,
        isAvailable: res.isAvailable,
        isSoldOut: !res.isAvailable,
        options,
        productInfo,
        images: [],
        sortOrder: 0,
        isPopular: res.isPopular ?? false,
        isNew: res.isNew ?? false,
        isRecommended: res.isRecommended ?? false,
        displayPriority: res.displayPriority ?? 0,
        likeCount: res.likeCount ?? 0,
        viewCount: res.viewCount ?? 0,
    };
}

export default function EditMenuPage() {
    const params = useParams();
    const router = useRouter();
    const { setTitle } = useUIStore();
    const { categories: apiCategories } = useCategories();
    const { success, error } = useToast();
    const [menu, setMenu] = useState<Partial<Menu> | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const id = Number(params?.id);

    const categories: MenuCategory[] = apiCategories.map((c) => ({
        id: c.id,
        korName: c.name,
        engName: '',
        icon: c.icon || '',
        sortOrder: c.sortOrder ?? 0,
        isActive: true,
    }));

    const fetchMenu = useCallback(async () => {
        if (!id || id <= 0) {
            setFetchError('잘못된 메뉴 ID입니다.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setFetchError(null);
        try {
            const res = await fetch(`${getApiBase()}/admin/menus/${id}`, { credentials: 'include' });
            if (!res.ok) {
                if (res.status === 404) setFetchError('메뉴를 찾을 수 없습니다.');
                else setFetchError('메뉴 정보를 불러오는데 실패했습니다.');
                setMenu(null);
                setLoading(false);
                return;
            }
            const data: MenuDetailApiResponse = await res.json();
            setMenu(apiResponseToInitialData(data));
            setTitle(`${data.korName} 수정`);
        } catch (e) {
            console.error(e);
            setFetchError('메뉴 정보를 불러오는데 실패했습니다.');
            setMenu(null);
        } finally {
            setLoading(false);
        }
    }, [id, setTitle]);

    useEffect(() => {
        fetchMenu();
    }, [fetchMenu]);

    const handleSubmit = async (data: any) => {
        try {
            const res = await fetch(`${getApiBase()}/admin/menus/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    korName: data.korName,
                    engName: data.engName,
                    description: data.description ?? '',
                    price: Number(data.price) || 0,
                    categoryId: Number(data.category) ?? menu?.category ?? categories[0]?.id,
                    isAvailable: !data.isSoldOut,
                    optionsJson: data.optionsJson ?? (data.options?.length ? JSON.stringify(data.options) : null),
                    productInfoJson: data.productInfoJson ?? null,
                    isPopular: data.isPopular ?? false,
                    isNew: data.isNew ?? false,
                    isRecommended: data.isRecommended ?? false,
                    displayPriority: data.displayPriority ?? 0,
                }),
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || '메뉴 수정에 실패했습니다.');
            }
            if (Array.isArray(data.imageFiles) && data.imageFiles.length > 0) {
                for (const file of data.imageFiles) {
                    const formData = new FormData();
                    formData.append('file', file);
                    const imgRes = await fetch(`${getApiBase()}/admin/menus/${id}/images`, {
                        method: 'POST',
                        credentials: 'include',
                        body: formData,
                    });
                    if (!imgRes.ok) {
                        success('메뉴 정보가 수정되었습니다. 일부 이미지 업로드에 실패했습니다.');
                        break;
                    }
                }
                success('메뉴 정보가 수정되었습니다.');
            } else {
                success('메뉴 정보가 수정되었습니다.');
            }
            router.push(`/admin/menus/${id}`);
        } catch (e) {
            error(e instanceof Error ? e.message : '메뉴 수정에 실패했습니다.');
        }
    };

    const handleCancel = () => {
        router.back();
    };

    if (loading) {
        return <div className={styles.loading}>정보를 불러오는 중...</div>;
    }
    if (fetchError || !menu) {
        return (
            <main className={styles.container}>
                <div className={styles.pageInner}>
                    <p className={styles.error}>{fetchError ?? '메뉴를 찾을 수 없습니다.'}</p>
                    <Link href="/admin/menus" className={styles.backBtn}>
                        <ChevronLeft size={14} />
                        <span>목록으로</span>
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.container}>
            <div className={styles.pageInner}>
                <div className={styles.pageHeader}>
                    <p className={styles.pageLabel}>Menu Management</p>
                    <h2 className={styles.pageTitle}>메뉴 수정</h2>
                </div>
                <Link href={`/admin/menus/${id}`} className={styles.backBtn}>
                    <ChevronLeft size={14} />
                    <span>상세로 돌아가기</span>
                </Link>
                <div className={styles.divider} />
                <div className={styles.formCard}>
                    <MenuForm
                        initialData={menu}
                        categories={categories}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    />
                </div>
            </div>
        </main>
    );
}
