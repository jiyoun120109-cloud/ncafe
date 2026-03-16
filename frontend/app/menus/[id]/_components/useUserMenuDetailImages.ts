'use client';

import { useState, useEffect } from 'react';
import { getApiBase } from '@/services/api';

export interface UserMenuImage {
    id: number;
    imageUrl: string;
    menuId: number;
    sortOrder: number;
}

interface ResponseDto {
    menuImages: UserMenuImage[];
    altText: string;
}

export function useUserMenuDetailImages(menuId: string | null) {
    const [menuImages, setMenuImages] = useState<UserMenuImage[]>([]);
    const [altText, setAltText] = useState('');

    useEffect(() => {
        if (!menuId) return;
        const numericId = Number.parseInt(menuId, 10);
        if (!Number.isFinite(numericId) || numericId <= 0) return;
        const finalId = String(numericId);
        let cancelled = false;
        fetch(`${getApiBase()}/menus/${finalId}/menu-images`)
            .then((res) => res.ok ? res.json() : Promise.reject(new Error('Failed to load images')))
            .then((data: ResponseDto) => {
                if (!cancelled) {
                    setMenuImages(data.menuImages ?? []);
                    setAltText(data.altText ?? '');
                }
            })
            .catch(() => {
                if (!cancelled) setMenuImages([]);
            });
        return () => { cancelled = true; };
    }, [menuId]);

    return { menuImages, altText };
}
