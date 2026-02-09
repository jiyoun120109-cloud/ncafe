'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './MenuDetailImages.module.css';
import { useMenuDetailImages } from './useMenuDetailImages';

export default function MenuDetailImages({ menuId }: { menuId: number }) {
    const { menuImages, altText } = useMenuDetailImages(menuId);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        if (menuImages.length > 0 && !selectedImage) {
            setSelectedImage(menuImages[0].imageUrl);
        }
    }, [menuImages, selectedImage]);

    return (
        <section className={styles.imageSection}>
            <div className={styles.mainImageWrapper}>
                {selectedImage ? (
                    <Image
                        src={`http://localhost:8080/upload/${selectedImage}`}
                        alt={`${altText || 'Menu'} Main Image`}
                        fill
                        className={styles.mainImage}
                        priority
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
                                src={`http://localhost:8080/upload/${image.imageUrl}`}
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
