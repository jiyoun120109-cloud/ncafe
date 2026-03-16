'use client';

import { useState, useEffect, useCallback } from 'react';
import { getApiBase } from '@/services/api';

/** 응답 본문에서 에러 메시지 추출 (JSON.message 또는 전체 텍스트) */
function parseErrorMessage(text: string, fallback: string): string {
    if (!text?.trim()) return fallback;
    try {
        const j = JSON.parse(text) as { message?: string };
        return (j && typeof j.message === 'string') ? j.message : text;
    } catch {
        return text;
    }
}

export interface AdminCategoryDto {
    id: number;
    name: string;
    icon?: string | null;
    description?: string | null;
}

export interface AdminCategoryListResponse {
    categories: AdminCategoryDto[];
    total: number;
}

export function useAdminCategories() {
    const [categories, setCategories] = useState<AdminCategoryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${getApiBase()}/admin/categories`, { credentials: 'include' });
            if (!res.ok) throw new Error('카테고리 목록을 불러오는데 실패했습니다.');
            const data: AdminCategoryListResponse = await res.json();
            setCategories(data.categories ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : '오류가 발생했습니다.');
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    /**
     * 카테고리 생성.
     * API 스펙: 201 응답 본문은 반드시 { id: number, name: string } 플랫 형태.
     * 백엔드가 { data: { id, name } } 등 감싼 형태로 바꾸면 아래 파싱 한 곳만 수정.
     */
    const createCategory = useCallback(async (name: string, icon?: string | null, description?: string | null): Promise<AdminCategoryDto | null> => {
        try {
            const res = await fetch(`${getApiBase()}/admin/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: name.trim(),
                    icon: icon?.trim() || undefined,
                    description: description?.trim() || undefined,
                }),
            });
            const text = await res.text();
            if (!res.ok) {
                throw new Error(parseErrorMessage(text, res.statusText));
            }
            // 플랫 응답 전제. 감싼 형태면 예: const body = JSON.parse(text); return body.data ?? body;
            const created: AdminCategoryDto = text ? JSON.parse(text) : { id: 0, name };
            await fetchCategories();
            return created;
        } catch (e) {
            throw e;
        }
    }, [fetchCategories]);

    const updateCategory = useCallback(async (id: number, name: string, icon?: string | null, description?: string | null): Promise<void> => {
        const res = await fetch(`${getApiBase()}/admin/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                name: name.trim(),
                icon: icon?.trim() || undefined,
                description: description?.trim() || undefined,
            }),
        });
        const text = await res.text();
        if (!res.ok) {
            throw new Error(parseErrorMessage(text, res.statusText));
        }
        await fetchCategories();
    }, [fetchCategories]);

    const deleteCategory = useCallback(async (id: number): Promise<void> => {
        const res = await fetch(`${getApiBase()}/admin/categories/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(parseErrorMessage(text, res.statusText));
        }
        await fetchCategories();
    }, [fetchCategories]);

    /** 카테고리 아이콘 이미지 업로드. FormData에 "file" 키로 파일 전달. 반환: { url, filename } */
    const uploadCategoryIcon = useCallback(async (file: File): Promise<{ url: string; filename: string }> => {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch(`${getApiBase()}/admin/categories/upload`, {
            method: 'POST',
            credentials: 'include',
            body: form,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error((err as { error?: string }).error || '아이콘 업로드에 실패했습니다.');
        }
        return res.json();
    }, []);

    /** 카테고리 순서 변경 (DnD). categoryIds: 원하는 순서대로 ID 배열 */
    const reorderCategories = useCallback(async (categoryIds: number[]): Promise<void> => {
        const res = await fetch(`${getApiBase()}/admin/categories/reorder`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ categoryIds }),
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(parseErrorMessage(text, res.statusText));
        }
        await fetchCategories();
    }, [fetchCategories]);

    return {
        categories,
        loading,
        error,
        refetch: fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        uploadCategoryIcon,
        reorderCategories,
    };
}
