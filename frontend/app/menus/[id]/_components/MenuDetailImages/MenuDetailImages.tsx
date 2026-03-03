'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './MenuDetailImages.module.css';
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
    const toImageSrc = (url: string) => url?.startsWith('http') ? url : `/images/${url}`;

    return (
        <section className={styles.imageSection}>
            <div className={styles.mainImageWrapper}>
                {!showMainPlaceholder ? (
                    <Image
                        src={toImageSrc(selectedImage!)}
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
                                src={toImageSrc(image.imageUrl)}
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
