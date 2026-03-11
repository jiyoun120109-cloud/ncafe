'use client';

import { useState, useEffect, useCallback } from 'react';
import { getApiBase } from '@/services/api';

export interface MenuImage {
    id: number;
    imageUrl: string;
    menuId: number;
    sortOrder: number;
}

interface MenuDetailImagesResponse {
    menuImages: MenuImage[];
    altText: string;
}

export function useMenuDetailImages(menuId: number) {
    const [menuImages, setMenuImages] = useState<MenuImage[]>([]);
    const [altText, setAltText] = useState<string>('');

    const fetchImages = useCallback(async () => {
        if (!menuId) return;
        try {
            const response = await fetch(`${getApiBase()}/admin/menus/${menuId}/menu-images`);
            if (response.ok) {
                const data: MenuDetailImagesResponse = await response.json();
                setMenuImages(data.menuImages ?? []);
                setAltText(data.altText ?? '');
            }
        } catch {
            setMenuImages([]);
        }
    }, [menuId]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const reorderImages = useCallback(async (orderedImageIds: number[]) => {
        if (!menuId || orderedImageIds.length === 0) return;
        try {
            const res = await fetch(`${getApiBase()}/admin/menus/${menuId}/menu-images/order`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ orderedImageIds }),
            });
            if (res.ok) await fetchImages();
        } catch {
            // ignore
        }
    }, [menuId, fetchImages]);

    const setAsRepresentative = useCallback((imageId: number) => {
        const currentIds = menuImages.map((img) => img.id);
        const idx = currentIds.indexOf(imageId);
        if (idx <= 0) return;
        const newOrder = [imageId, ...currentIds.filter((id) => id !== imageId)];
        reorderImages(newOrder);
    }, [menuImages, reorderImages]);

    return { menuImages, altText, refetchImages: fetchImages, setAsRepresentative };
}
