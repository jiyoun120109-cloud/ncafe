'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getFavorites, removeFavorite, type FavoriteDto } from '@/services/favoriteService';
import { getApiBase } from '@/services/api';
import PageWithHero from '@/components/PageWithHero/PageWithHero';
import styles from './page.module.css';

interface MenuInfo {
  id: number;
  korName?: string;
  name?: string;
  price?: number;
  imageSrc?: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [favorites, setFavorites] = useState<FavoriteDto[]>([]);
  const [menus, setMenus] = useState<Record<number, MenuInfo>>({});
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?returnUrl=${encodeURIComponent('/favorites')}`);
      return;
    }
    const load = async () => {
      try {
        const list = await getFavorites();
        setFavorites(list);
        const res = await fetch(`${getApiBase()}/menus`, { credentials: 'include' });
        const data = await res.json();
        const menuList = data.menus ?? data ?? [];
        const map: Record<number, MenuInfo> = {};
        (Array.isArray(menuList) ? menuList : []).forEach((m: MenuInfo) => {
          map[m.id] = m;
        });
        setMenus(map);
      } catch {
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, router]);

  const handleRemove = async (menuId: number) => {
    setRemovingId(menuId);
    try {
      await removeFavorite(menuId);
      setFavorites((prev) => prev.filter((f) => f.menuId !== menuId));
    } finally {
      setRemovingId(null);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <PageWithHero
      title="찜 목록"
      subtitle="저장한 메뉴를 한눈에 보세요."
      backHref="/menus"
      backLabel="메뉴"
    >
      {loading ? (
        <div className={styles.loading}>불러오는 중...</div>
      ) : favorites.length === 0 ? (
        <p className={styles.empty}>찜한 메뉴가 없습니다.</p>
      ) : (
        <ul className={styles.list}>
          {favorites.map((f) => {
            const menu = menus[f.menuId];
            const name = menu?.korName ?? menu?.name ?? `메뉴 #${f.menuId}`;
            const price = menu?.price;
            return (
              <li key={f.id} className={styles.item}>
                <Link href={`/menus/${f.menuId}`} className={styles.itemLink}>
                  <span className={styles.itemName}>{name}</span>
                  {price != null && <span className={styles.itemPrice}>{price.toLocaleString()}원</span>}
                </Link>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => handleRemove(f.menuId)}
                  disabled={removingId === f.menuId}
                  aria-label="찜 해제"
                >
                  <Heart size={18} fill="currentColor" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </PageWithHero>
  );
}
