'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Upload, Star } from 'lucide-react';
import { getApiBase } from '@/services/api';
import { menuImageUrl } from '@/utils/menuImageUrl';
import styles from './MenuDetailImages.module.css';
import { useMenuDetailImages } from './useMenuDetailImages';

export default function MenuDetailImages({ menuId }: { menuId: number }) {
    const { menuImages, altText, refetchImages, setAsRepresentative } = useMenuDetailImages(menuId);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [mainImgError, setMainImgError] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (menuImages.length > 0 && !selectedImage) {
            setSelectedImage(menuImages[0].imageUrl);
            setMainImgError(false);
        }
    }, [menuImages, selectedImage]);

    const showMainPlaceholder = !selectedImage || mainImgError;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`${getApiBase()}/admin/menus/${menuId}/images`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            if (res.ok) await refetchImages();
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <section className={styles.imageSection}>
            <div className={styles.mainImageWrapper}>
                {!showMainPlaceholder ? (
                    <Image
                        src={menuImageUrl(selectedImage)}
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
                    {menuImages.map((image, index) => (
                        <div
                            key={image.id}
                            className={`${styles.thumbnailWrap} ${selectedImage === image.imageUrl ? styles.activeThumbnail : ''}`}
                        >
                            <div
                                className={styles.thumbnail}
                                onClick={() => setSelectedImage(image.imageUrl)}
                            >
                                <Image
                                    src={menuImageUrl(image.imageUrl)}
                                    alt={`${altText || 'Menu'} ${index + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 20vw, 10vw"
                                />
                            </div>
                            {index > 0 && (
                                <button
                                    type="button"
                                    className={styles.repBtn}
                                    onClick={(e) => { e.stopPropagation(); setAsRepresentative(image.id); }}
                                    title="대표 이미지로 설정"
                                >
                                    <Star size={12} />
                                    대표
                                </button>
                            )}
                            {index === 0 && <span className={styles.repBadge}>대표</span>}
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.uploadRow}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                    aria-label="이미지 추가"
                    disabled={uploading}
                />
                <button
                    type="button"
                    className={styles.addImageBtn}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                >
                    <Upload size={16} />
                    {uploading ? ' 업로드 중…' : ' 이미지 추가'}
                </button>
            </div>
        </section>
    );
}
