import { useState, useEffect } from 'react';
import { fetcher } from '@/services/api';

export interface CategoryResponseDto {
    id: number;
    name: string;
    icon: string;
    sortOrder: number;
    menuCount: number;
}

export interface CategoryListResponseDto {  //얘가 url로 내보내는 데이터
    categories: CategoryResponseDto[];
    totalCount: number;
}

export const useCategories = () => {
    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
    const [categoryCount, setCategoryCount] = useState<number | null>(null); // 전체 개수

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. 카테고리와 메뉴 동시 가져오기 (public API)
                const [catData, menusData] = await Promise.all([
                    fetcher('/categories'),
                    fetcher('/menus')
                ]);
                const menus = menusData.menus || [];

                // 2. 카테고리별 개수 계산
                const counts: Record<string, number> = {};
                menus.forEach((menu: any) => {
                    const key = menu.categoryName || menu.category || 'unknown';
                    counts[key] = (counts[key] || 0) + 1;
                });

                // 3. 데이터 가공
                const mapped: CategoryResponseDto[] = catData.categories || catData.map ?
                    (catData.categories || catData).map((c: any) => ({
                        id: c.id,
                        name: c.korName || c.name,
                        icon: c.icon || '',
                        sortOrder: c.sortOrder || 0,
                        menuCount: counts[c.name] || 0
                    })) : [];

                setCategories(mapped);
                setCategoryCount(menusData.total || menus.length);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    return { categories, categoryCount };
};


