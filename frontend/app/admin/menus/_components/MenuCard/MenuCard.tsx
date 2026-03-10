import { useState, memo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, GripVertical, AlertTriangle } from 'lucide-react';
import DeleteConfirmModal from '@/components/DeleteConfirmModal/DeleteConfirmModal';
import styles from './MenuCard.module.css';
import { MenuResponse } from '../MenuList/useMenus';
import { getApiBase } from '@/services/api';

function isValidImageUrl(url: string | null | undefined): boolean {
    if (!url?.trim()) return false;
    if (url.startsWith('http')) {
        try {
            const path = new URL(url).pathname;
            return /\.(png|jpe?g|gif|webp|svg|ico)(\?|$)/i.test(path);
        } catch {
            return false;
        }
    }
    return true;
}

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

interface MenuCardProps {
    menu: MenuResponse;
    onUpdated?: () => void;
    /** DND: attach to drag handle (from useSortable) */
    dragHandleProps?: {
        listeners?: Record<string, unknown> | undefined;
        attributes?: Record<string, unknown>;
    };
}

function MenuCard({ menu, onUpdated, dragHandleProps }: MenuCardProps) {
    const router = useRouter();
    const [imgError, setImgError] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const handleCardClick = () => {
        router.push(`/admin/menus/${menu.id}`);
    };

    const handleToggleAvailability = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await fetch(`${getApiBase()}/admin/menus/${menu.id}`, { credentials: 'include' });
            if (!res.ok) throw new Error('메뉴 정보를 불러올 수 없습니다.');
            const detail = await res.json();
            const next = !detail.isAvailable;
            const putRes = await fetch(`${getApiBase()}/admin/menus/${menu.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    korName: detail.korName,
                    engName: detail.engName,
                    description: detail.description,
                    price: detail.price,
                    categoryId: detail.categoryId,
                    isAvailable: next,
                }),
            });
            if (!putRes.ok) throw new Error('품절 상태 변경에 실패했습니다.');
            onUpdated?.();
        } catch (err) {
            console.error(err);
            alert(err instanceof Error ? err.message : '품절 상태 변경에 실패했습니다.');
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/admin/menus/${menu.id}/edit`);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const res = await fetch(`${getApiBase()}/admin/menus/${menu.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('삭제에 실패했습니다.');
            onUpdated?.();
        } catch (err) {
            console.error(err);
            alert(err instanceof Error ? err.message : '삭제에 실패했습니다.');
            throw err;
        }
    };

    const showPlaceholder = !menu.imageSrc || imgError || !isValidImageUrl(menu.imageSrc);

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
                    {...(dragHandleProps?.listeners ?? {})}
                    {...(dragHandleProps?.attributes ?? {})}
                >
                    <GripVertical size={18} />
                </div>

                {/* Image Section */}
                <div className={styles.imageContainer}>
                    {!showPlaceholder ? (
                        <Image
                            src={imageSrc(menu.imageSrc)}
                            alt={menu.korName}
                            fill
                            className={styles.image}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={() => setImgError(true)}
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
                        <div className={styles.statusToggle} onClick={handleToggleAvailability}>
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
                                onClick={handleEdit}
                                title="수정"
                            >
                                <Edit2 size={16} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1, color: 'var(--color-error-600)' }}
                                whileTap={{ scale: 0.9 }}
                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                onClick={handleDeleteClick}
                                title="삭제"
                            >
                                <Trash2 size={16} />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>

            <DeleteConfirmModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="메뉴 삭제"
                message={`"${menu.korName}" 메뉴를 삭제할까요? 이 작업은 되돌릴 수 없습니다.`}
            />
        </div>
    );
}

export default memo(MenuCard);
