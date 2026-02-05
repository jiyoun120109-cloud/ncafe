'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ChevronLeft,
    Edit2,
    Trash2,
    Clock,
    CheckCircle2,
    AlertCircle,
    Star,
    Flame,
    ShieldAlert,
    Droplets,
    Wheat,
    TrendingUp,
    Users
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useMenuStore } from '@/stores/menuStore';
import { useToast } from '@/hooks/useToast';
import { mockCategories } from '@/mocks/menuData';
import { Menu } from '@/types/menu';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import styles from './page.module.css';

export default function MenuDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { setTitle } = useUIStore();
    const { menus, deleteMenu } = useMenuStore();
    const { success } = useToast();
    const [menu, setMenu] = useState<Menu | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const id = params?.id as string;

    useEffect(() => {
        const foundMenu = menus.find(m => m.id === id);
        if (foundMenu) {
            setMenu(foundMenu);
            setTitle(`${foundMenu.korName} 상세 정보`);
        } else {
            setTitle('메뉴 정보 없음');
        }
    }, [id, setTitle, menus]);

    const category = useMemo(() => {
        if (!menu) return null;
        return mockCategories.find(c => c.id === menu.category);
    }, [menu]);

    const handleDelete = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (menu) {
            deleteMenu(menu.id);
            success('메뉴가 삭제되었습니다.');
            router.push('/admin/menus');
        }
    };

    if (!menu) {
        return (
            <div className={styles.loading}>
                <p>메뉴 정보를 불러오는 중입니다...</p>
            </div>
        );
    }

    const primaryImage = menu.images.find(img => img.isPrimary) || menu.images[0];

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <Link href="/admin/menus" className={styles.backBtn}>
                    <ChevronLeft size={20} />
                    <span>목록으로</span>
                </Link>
                <div className={styles.actions}>
                    <Link href={`/admin/menus/${id}/edit`} className={styles.editBtn}>
                        <Edit2 size={18} />
                        <span>수정</span>
                    </Link>
                    <button onClick={handleDelete} className={styles.deleteBtn}>
                        <Trash2 size={18} />
                        <span>삭제</span>
                    </button>
                </div>
            </div>

            <div className={styles.content}>
                {/* Left Side: Images */}
                <section className={styles.imageSection}>
                    <div className={styles.mainImageWrapper}>
                        {primaryImage ? (
                            <Image
                                src={primaryImage.url}
                                alt={menu.korName}
                                fill
                                className={styles.mainImage}
                                priority
                            />
                        ) : (
                            <div className={styles.imagePlaceholder}>
                                <span>이미지 없음</span>
                            </div>
                        )}
                        {menu.isSoldOut && (
                            <div className={styles.soldOutOverlay}>
                                <span>품절</span>
                            </div>
                        )}
                    </div>
                    {menu.images.length > 1 && (
                        <div className={styles.thumbnailGrid}>
                            {menu.images.map(img => (
                                <div key={img.id} className={`${styles.thumbnail} ${img.isPrimary ? styles.activeThumbnail : ''}`}>
                                    <Image src={img.url} alt={menu.korName} fill />
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Right Side: Info */}
                <section className={styles.infoSection}>
                    <div className={styles.infoCard}>
                        <div className={styles.basicInfo}>
                            <div className={styles.titleRow}>
                                <div className={styles.tagWrapper}>
                                    <span className={styles.categoryBadge}>
                                        {category?.icon} {category?.korName}
                                    </span>
                                    {/* Mock Tags */}
                                    <span className={`${styles.tag} ${styles.best}`}>
                                        <Star size={12} fill="currentColor" /> BEST
                                    </span>
                                    {menu.id.includes('1') && (
                                        <span className={`${styles.tag} ${styles.signature}`}>
                                            <Flame size={12} fill="currentColor" /> SIGNATURE
                                        </span>
                                    )}
                                </div>
                                <h1 className={styles.korName}>{menu.korName}</h1>
                                <p className={styles.engName}>{menu.engName}</p>
                            </div>
                            <p className={styles.price}>{menu.price.toLocaleString()}원</p>
                            <p className={styles.description}>{menu.description}</p>
                        </div>

                        {/* Sales Snapshot (Mock) */}
                        <div className={styles.statsSection}>
                            <h2 className={styles.sectionTitle}>주간 퍼포먼스</h2>
                            <div className={styles.statsGrid}>
                                <div className={styles.statItem}>
                                    <div className={styles.statLabel}>주간 판매량</div>
                                    <div className={styles.statValue}>
                                        <TrendingUp size={16} className={styles.statIcon} />
                                        128건 <span className={styles.statTrend}>+12%</span>
                                    </div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statLabel}>재주문율</div>
                                    <div className={styles.statValue}>
                                        <Users size={16} className={styles.statIcon} />
                                        24.5%
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.statusSection}>
                            <h2 className={styles.sectionTitle}>판매 상태</h2>
                            <div className={styles.statusGrid}>
                                <div className={`${styles.statusItem} ${!menu.isSoldOut ? styles.activeStatus : ''}`}>
                                    <CheckCircle2 size={18} />
                                    <span>판매중</span>
                                </div>
                                <div className={`${styles.statusItem} ${menu.isSoldOut ? styles.activeSoldOut : ''}`}>
                                    <AlertCircle size={18} />
                                    <span>품절</span>
                                </div>
                            </div>
                        </div>

                        {/* Nutritional & Allergen Info (Mock) */}
                        <div className={styles.nutritionSection}>
                            <div className={styles.nutritionHeader}>
                                <h2 className={styles.sectionTitle}>영양 성분 및 알레르기</h2>
                            </div>
                            <div className={styles.nutritionGrid}>
                                <div className={styles.nutritionItem}>
                                    <span className={styles.nutLabel}>칼로리</span>
                                    <span className={styles.nutValue}>125 kcal</span>
                                </div>
                                <div className={styles.nutritionItem}>
                                    <span className={styles.nutLabel}>당류</span>
                                    <span className={styles.nutValue}>12 g</span>
                                </div>
                                <div className={styles.nutritionItem}>
                                    <span className={styles.nutLabel}>카페인</span>
                                    <span className={styles.nutValue}>150 mg</span>
                                </div>
                            </div>
                            <div className={styles.allergenInfo}>
                                <div className={styles.allergenTitle}>알레르기 유발 물질:</div>
                                <div className={styles.allergenTags}>
                                    <span className={styles.allergenTag} title="우유 포함">
                                        <Droplets size={14} /> 우유
                                    </span>
                                    <span className={styles.allergenTag} title="대두 포함">
                                        <ShieldAlert size={14} /> 대두
                                    </span>
                                    <span className={styles.allergenTag} title="밀 포함">
                                        <Wheat size={14} /> 밀
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.optionSection}>
                            <h2 className={styles.sectionTitle}>옵션 설정</h2>
                            {menu.options && menu.options.length > 0 ? (
                                <div className={styles.optionList}>
                                    {menu.options.map(option => (
                                        <div key={option.id} className={styles.optionItem}>
                                            <div className={styles.optionHeader}>
                                                <span className={styles.optionName}>{option.name}</span>
                                                <span className={styles.optionType}>
                                                    {option.required ? '(필수)' : '(선택)'} · {option.type === 'radio' ? '단일선택' : '다중선택'}
                                                </span>
                                            </div>
                                            <div className={styles.optionValues}>
                                                {option.items.map(value => (
                                                    <span key={value.id} className={styles.optionValue}>
                                                        {value.name} (+{value.priceDelta.toLocaleString()}원)
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.emptyText}>등록된 옵션이 없습니다.</p>
                            )}
                        </div>

                        <div className={styles.metaSection}>
                            <div className={styles.metaItem}>
                                <Clock size={16} />
                                <span>최초 등록: {menu.createdAt instanceof Date ? menu.createdAt.toLocaleDateString() : new Date(menu.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className={styles.metaItem}>
                                <Clock size={16} />
                                <span>최종 수정: {menu.updatedAt instanceof Date ? menu.updatedAt.toLocaleDateString() : new Date(menu.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* 삭제 확인 모달 */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="메뉴 삭제 확인"
            >
                <div className={styles.deleteModalContent}>
                    <p>정말로 이 메뉴를 삭제하시겠습니까? 삭제된 정보는 복구할 수 없습니다.</p>
                    <div className={styles.modalActions}>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            취소
                        </Button>
                        <Button variant="danger" onClick={confirmDelete}>
                            삭제하기
                        </Button>
                    </div>
                </div>
            </Modal>
        </main>
    );
}
