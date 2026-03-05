'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './MenuDetailImages.module.css';

function imageSrc(url: string | null | undefined): string {
    if (!url?.trim()) return '/images/missing';
    if (url.startsWith('http')) {
        try {
            const path = new URL(url).pathname;
            const hasImageExt = /\.(png|jpe?g|gif|webp|svg|ico)(\?|$)/i.test(path);
            if (!hasImageExt) return '/images/missing';
        } catch {
            return '/images/missing';
        }
        return url;
    }
    const filename = url.replace(/^.*\//, '').trim();
    return `/images/${filename || 'missing'}`;
}
import { useUserMenuDetailImages } from '../useUserMenuDetailImages';

interface MenuDetailImagesProps {
    menuId: string;
}

export default function MenuDetailImages({ menuId }: MenuDetailImagesProps) {
    const { menuImages, altText } = useUserMenuDetailImages(menuId);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [mainImgError, setMainImgError] = useState(false);

    useEffect(() => {
        if (menuImages.length > 0 && !selectedImage) {
            setSelectedImage(menuImages[0].imageUrl);
            setMainImgError(false);
        }
    }, [menuImages, selectedImage]);

    const showMainPlaceholder = !selectedImage || mainImgError;
    return (
        <section className={styles.imageSection}>
            <div className={styles.mainImageWrapper}>
                {!showMainPlaceholder ? (
                    <Image
                        src={imageSrc(selectedImage!)}
                        alt={altText || '메뉴 이미지'}
                        fill
                        className={styles.mainImage}
                        priority
                        onError={() => setMainImgError(true)}
                    />
                ) : (
                    <div className={styles.imagePlaceholder}>
                        <span>이미지 없음</span>
                    </div>
                )}
            </div>
            {menuImages.length > 0 && (
                <div className={styles.thumbnailGrid}>
                    {menuImages.map((image) => (
                        <button
                            key={image.id}
                            type="button"
                            className={`${styles.thumbnail} ${selectedImage === image.imageUrl ? styles.activeThumbnail : ''}`}
                            onClick={() => setSelectedImage(image.imageUrl)}
                        >
                            <Image
                                src={imageSrc(image.imageUrl)}
                                alt={`${altText || '메뉴'} ${image.sortOrder}`}
                                fill
                                sizes="(max-width: 768px) 20vw, 10vw"
                            />
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
}
