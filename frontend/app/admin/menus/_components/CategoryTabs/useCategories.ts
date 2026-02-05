import { useState, useEffect } from 'react';
import { menuService } from '@/services/menuService';

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
                // 1. 카테고리와 메뉴 동시 가져오기
                const [catRes, menusRes] = await Promise.all([
                    fetch('http://localhost:8080/admin/categories'),
                    fetch('http://localhost:8080/admin/menus')
                ])

                if (!catRes.ok || !menusRes.ok) throw new Error('데이터 로드 실패');
                const menusData = await menusRes.json();
                const menus = menusData.menus || []; // API가 { menus: [...], total: ... } 형태로 반환
                const catData = await catRes.json();

                // 2. 카테고리별 개수 계산
                const counts: Record<string, number> = {};
                menus.forEach((menu: any) => {
                    counts[menu.categoryName] = (counts[menu.categoryName] || 0) + 1;
                });

                // 3. 데이터 가공
                const mapped: CategoryResponseDto[] = catData.map((c: any) => ({
                    id: c.id,
                    name: c.korName || c.name,
                    icon: c.icon || '',
                    sortOrder: c.sortOrder || 0,
                    menuCount: counts[String(c.id)] || 0
                }));

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


