'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './MenuDetailImages.module.css';
import { useMenuDetailImages } from './useMenuDetailImages';

export default function MenuDetailImages({ menuId }: { menuId: number }) {
    const { menuImages, altText } = useMenuDetailImages(menuId);
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
                        src={`/images/${selectedImage}`}
                        alt={`${altText || 'Menu'} Main Image`}
                        fill
                        className={styles.mainImage}
                        priority
                        onError={() => setMainImgError(true)}
                    />
                ) : (
                    <div className={styles.imagePlaceholder}>
                        <span>No Image Selected</span>
                    </div>
                )}
            </div>

            {menuImages.length > 0 && (
                <div className={styles.thumbnailGrid}>
                    {menuImages.map((image) => (
                        <div
                            key={image.id}
                            className={`${styles.thumbnail} ${selectedImage === image.imageUrl ? styles.activeThumbnail : ''}`}
                            onClick={() => setSelectedImage(image.imageUrl)}
                        >
                            <Image
                                src={`/images/${image.imageUrl}`}
                                alt={`${altText || 'Menu'} Thumbnail ${image.sortOrder}`}
                                fill
                                sizes="(max-width: 768px) 20vw, 10vw"
                            />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
