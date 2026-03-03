'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import styles from './MenuCard.module.css';
import type { UserMenuResponse } from '../useUserMenus';

interface MenuCardProps {
    menu: UserMenuResponse;
}

export default function MenuCard({ menu }: MenuCardProps) {
    const router = useRouter();
    const [imgError, setImgError] = useState(false);

    const handleCardClick = () => {
        router.push(`/menus/${menu.id}`);
    };

    const showPlaceholder = !menu.imageSrc || imgError;
    const imageSrc = menu.imageSrc?.startsWith('http') ? menu.imageSrc : `/images/${menu.imageSrc}`;

    return (
        <article
            className={styles.card}
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
        >
            {/* 이미지 */}
            <div className={styles.imageContainer}>
                {!showPlaceholder ? (
                    <Image
                        src={imageSrc}
                        alt={menu.korName}
                        fill
                        className={styles.image}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <AlertTriangle className={styles.placeholderIcon} />
                        <span>이미지 없음</span>
                    </div>
                )}
                {!menu.isAvailable && (
                    <div className={styles.soldOutOverlay}>
                        <span className={styles.soldOutBadge}>품절</span>
                    </div>
                )}
            </div>

            {/* 컨텐츠 */}
            <div className={styles.content}>
                <span className={styles.category}>{menu.categoryName}</span>
                <h3 className={styles.korName}>{menu.korName}</h3>
                <p className={styles.description}>{menu.description}</p>

                <div className={styles.footer}>
                    <span className={styles.price}>{menu.price.toLocaleString()}원</span>
                    <button
                        className={styles.arrowBtn}
                        aria-label={`${menu.korName} 상세보기`}
                        onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
                    >
                        <ArrowRight size={15} />
                    </button>
                </div>
            </div>
        </article>
    );
}
