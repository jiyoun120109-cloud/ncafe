import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, MoreVertical, Image as ImageIcon, GripVertical, AlertTriangle } from 'lucide-react';
import styles from './MenuCard.module.css';
import { MenuResponse } from '../MenuList/useMenus';

interface MenuCardProps {
    menu: MenuResponse;
}

export default function MenuCard({ menu }: MenuCardProps) {
    const router = useRouter();

    const handleCardClick = () => {
        router.push(`/admin/menus/${menu.id}`);
    };

    return (
        <div
            className={`${styles.cardWrapper}`}
        >
            <motion.div
                className={styles.card}
                onClick={handleCardClick}
            >
                <div
                    className={styles.dragHandle}
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical size={18} />
                </div>

                {/* Image Section */}
                <div className={styles.imageContainer}>
                    {menu.imageSrc ? (
                        <Image
                            src={`/images/${menu.imageSrc}`}
                            alt={menu.korName}
                            fill
                            className={styles.image}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className={styles.placeholder}>
                            <>
                                <AlertTriangle className={styles.errorIcon} />
                                <span>이미지 로드 실패</span>
                            </>
                        </div>
                    )}

                    {!menu.isAvailable && (
                        <div className={styles.soldOutOverlay}>
                            <span className={styles.soldOutBadge}>품절</span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className={styles.content}>
                    <span className={styles.category}>{menu.categoryName}</span>
                    <div className={styles.nameRow}>
                        <h3 className={styles.korName}>{menu.korName}</h3>
                    </div>
                    <p className={styles.price}>{menu.price.toLocaleString()}원</p>
                    <p className={styles.description}>{menu.description}</p>

                    {/* Footer Section */}
                    <div className={styles.footer}>
                        <div className={styles.statusToggle} onClick={(e) => {
                            e.stopPropagation();
                        }}>
                            <div className={`${styles.toggleSwitch} ${menu.isAvailable ? styles.active : ''}`}>
                                <div className={styles.toggleHandle} />
                            </div>
                            <span className={styles.toggleLabel}>
                                {!menu.isAvailable ? '품절됨' : '판매중'}
                            </span>
                        </div>

                        <div className={styles.actions}>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={styles.actionBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                                title="수정"
                            >
                                <Edit2 size={16} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1, color: 'var(--color-error-600)' }}
                                whileTap={{ scale: 0.9 }}
                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                                title="삭제"
                            >
                                <Trash2 size={16} />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
