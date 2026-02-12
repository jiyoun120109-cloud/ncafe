'use client';

import { useState, useEffect } from 'react';

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

    useEffect(() => {
        if (!menuId) return;

        const fetchImages = async () => {
            try {
                const response = await fetch(`/api/admin/menus/${menuId}/menu-images`);
                if (response.ok) {
                    const data: MenuDetailImagesResponse = await response.json();
                    setMenuImages(data.menuImages);
                    setAltText(data.altText);
                } else {
                }
            } catch (error) {

            }
        };

        fetchImages();
    }, [menuId]);

    return { menuImages, altText };
}
