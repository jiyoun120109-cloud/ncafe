'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Package, Ticket, ChevronRight, Pencil, X, Heart, MessageCircle, Bell } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getMyOrders } from '@/services/orderService';
import {
  getUserStamps,
  getUserCoupons,
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  redeemCouponCode,
  type StampsDto,
  type UserCouponDto,
  type UserProfileDto,
} from '@/services/userService';
import { getApiBase } from '@/services/api';
import type { OrderDto } from '@/services/orderService';
import { getFavorites, type FavoriteDto } from '@/services/favoriteService';
import { getMyInquiries, type InquiryDto } from '@/services/inquiryService';
import { getMyNotifications, markNotificationRead, type NotificationDto } from '@/services/notificationService';
import PageWithHero from '@/components/PageWithHero/PageWithHero';
import styles from './page.module.css';

type Tab = 'profile' | 'orders' | 'coupons' | 'favorites' | 'inquiries' | 'notifications';

const TAB_IDS: Tab[] = ['profile', 'orders', 'coupons', 'favorites', 'inquiries', 'notifications'];

function getInitialTab(searchParams: ReturnType<typeof useSearchParams>): Tab | null {
  const tabParam = searchParams.get('tab');
  return tabParam && TAB_IDS.includes(tabParam as Tab) ? (tabParam as Tab) : null;
}

function UserPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, setUser, setProfileImageUrl, profileImageUrl: storeProfileImageUrl } = useAuthStore();
  const [tab, setTab] = useState<Tab | null>(() => getInitialTab(searchParams));
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [stamps, setStamps] = useState<StampsDto | null>(null);
  const [coupons, setCoupons] = useState<UserCouponDto[]>([]);
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', birthDate: '', phone: '', displayNickname: '' });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteDto[]>([]);
  const [favoritesMenus, setFavoritesMenus] = useState<Record<number, { korName?: string; name?: string; price?: number }>>({});
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [inquiries, setInquiries] = useState<InquiryDto[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponRedeemMessage, setCouponRedeemMessage] = useState<string | null>(null);
  const [couponRedeeming, setCouponRedeeming] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    setTab(tabParam && TAB_IDS.includes(tabParam as Tab) ? (tabParam as Tab) : null);
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?returnUrl=${encodeURIComponent('/user')}`);
      return;
    }
    const load = async () => {
      try {
        const [o, s, c] = await Promise.all([
          getMyOrders().catch(() => []),
          getUserStamps().catch(() => null),
          getUserCoupons().catch(() => []),
        ]);
        setOrders(o);
        setStamps(s ?? null);
        setCoupons(c);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || tab !== 'favorites') return;
    setFavoritesLoading(true);
    getFavorites()
      .then(async (list) => {
        setFavorites(list);
        const res = await fetch(`${getApiBase()}/menus`, { credentials: 'include' });
        const data = await res.json();
        const menuList = data.menus ?? data ?? [];
        const map: Record<number, { korName?: string; name?: string; price?: number }> = {};
        (Array.isArray(menuList) ? menuList : []).forEach((m: { id: number; korName?: string; name?: string; price?: number }) => {
          map[m.id] = { korName: m.korName, name: m.name, price: m.price };
        });
        setFavoritesMenus(map);
      })
      .catch(() => setFavorites([]))
      .finally(() => setFavoritesLoading(false));
  }, [isAuthenticated, tab]);

  useEffect(() => {
    if (!isAuthenticated || tab !== 'inquiries') return;
    setInquiriesLoading(true);
    getMyInquiries()
      .then(setInquiries)
      .catch(() => setInquiries([]))
      .finally(() => setInquiriesLoading(false));
  }, [isAuthenticated, tab]);

  useEffect(() => {
    if (!isAuthenticated || tab !== 'notifications') return;
    setNotificationsLoading(true);
    getMyNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setNotificationsLoading(false));
  }, [isAuthenticated, tab]);

  useEffect(() => {
    if (!isAuthenticated) return;
    getMyNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]));
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !profile && !profileLoading) {
      setProfileLoading(true);
      setProfileError(null);
      getUserProfile()
        .then((p) => {
          setProfile(p);
          setProfileImageUrl(p.profileImageUrl ?? null);
          setForm({
            name: p.name ?? '',
            email: p.email ?? '',
            birthDate: p.birthDate ?? '',
            phone: p.phone ?? '',
            displayNickname: p.displayNickname ?? '',
          });
        })
        .catch((e) => setProfileError(e instanceof Error ? e.message : '프로필을 불러올 수 없습니다.'))
        .finally(() => setProfileLoading(false));
    }
  }, [isAuthenticated, profile, profileLoading]);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    setProfileError(null);
    try {
      const updated = await updateUserProfile({
        name: form.name.trim() || undefined,
        email: form.email.trim() || undefined,
        birthDate: form.birthDate.trim() || null,
        phone: form.phone.trim() || undefined,
        displayNickname: form.displayNickname.trim() || undefined,
      });
      setProfile(updated);
      setEditing(false);
      const displayName = updated.displayNickname || updated.name || updated.username;
      setUser({ id: user!.id, username: updated.username, name: displayName, role: updated.role });
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : '수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setAvatarUploading(true);
    setProfileError(null);
    try {
      const { profileImageUrl } = await uploadProfileImage(file);
      setProfile((p) => (p ? { ...p, profileImageUrl } : p));
      setProfileImageUrl(profileImageUrl);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const profileImageSrc = profile?.profileImageUrl
    ? `${getApiBase()}/static/${profile.profileImageUrl}`
    : storeProfileImageUrl
      ? `${getApiBase()}/static/${storeProfileImageUrl}`
      : null;
  const displayName = profile?.displayNickname || profile?.name || user?.name || user?.username || '회원';

  const handleRedeemCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      setCouponRedeemMessage('쿠폰 코드를 입력해주세요.');
      return;
    }
    setCouponRedeeming(true);
    setCouponRedeemMessage(null);
    try {
      await redeemCouponCode(code);
      setCouponCode('');
      setCouponRedeemMessage('쿠폰이 등록되었어요! 🎉');
      const list = await getUserCoupons();
      setCoupons(list);
    } catch (e) {
      setCouponRedeemMessage(e instanceof Error ? e.message : '쿠폰 등록에 실패했어요.');
    } finally {
      setCouponRedeeming(false);
    }
  };

  if (!isAuthenticated) return null;

  const TAB_LIST: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: 'profile', icon: <User size={20} />, label: '프로필' },
    { id: 'orders', icon: <Package size={20} />, label: '주문내역' },
    { id: 'coupons', icon: <Ticket size={20} />, label: '쿠폰/스탬프' },
    { id: 'favorites', icon: <Heart size={20} />, label: '찜한 목록' },
    { id: 'inquiries', icon: <MessageCircle size={20} />, label: '1:1 문의' },
    { id: 'notifications', icon: <Bell size={20} />, label: '알림' },
  ];

  const getCategorySubtitle = (id: Tab): string => {
    switch (id) {
      case 'profile': return '정보 수정';
      case 'orders': return `최근 ${orders.length}건`;
      case 'coupons': return `스탬프 ${stamps?.stampCount ?? 0}/${stamps?.requiredForReward ?? 10}`;
      case 'favorites': return '클릭하여 이동';
      case 'inquiries': return '클릭하여 이동';
      case 'notifications': return '클릭하여 이동';
      default: return '클릭하여 이동';
    }
  };

  const needsInitialLoad = tab !== null && loading && ['orders', 'coupons'].includes(tab);

  return (
    <PageWithHero title="마이페이지" subtitle="주문 내역, 찜, 문의, 알림을 확인하세요.">
      <div className={styles.dashboard}>
        <div className={styles.dashboardProfile}>
          <div className={styles.dashboardProfileAvatar}>
            {profileImageSrc ? (
              <img src={profileImageSrc} alt="" className={styles.dashboardProfileImg} />
            ) : (
              <span className={styles.dashboardProfilePlaceholder} aria-hidden><User size={28} strokeWidth={1.5} /></span>
            )}
          </div>
          <span className={styles.dashboardProfileName}>{displayName}</span>
        </div>
        <nav className={styles.dashboardCategoryRow} aria-label="마이페이지 메뉴">
          {TAB_LIST.map(({ id, icon, label }) => (
            <Link
              key={id}
              href={`/user?tab=${id}`}
              className={tab === id ? styles.dashboardCategoryCardActive : styles.dashboardCategoryCard}
              aria-current={tab === id ? 'page' : undefined}
            >
              <span className={styles.dashboardCategoryTitle}>{label}</span>
              <span className={styles.dashboardCategoryLabel}>{icon} {label}</span>
              <span className={styles.dashboardCategorySub}>{getCategorySubtitle(id)}</span>
            </Link>
          ))}
        </nav>
      </div>

      {tab !== null && needsInitialLoad ? (
        <div className={styles.loading}>불러오는 중...</div>
      ) : tab !== null ? (
        <div className={`${styles.content} ${styles.dashboardPanel}`}>
          <p className={styles.backToMypage}>
            <Link href="/user">← 마이페이지</Link>
          </p>
          {tab === 'profile' && (
            <section className={`${styles.profileSection} ${styles.dashboardSection}`}>
              <div className={styles.profileHeader}>
                <h2 className={styles.sectionTitle}>프로필</h2>
                {profile && !editing && (
                  <button type="button" className={styles.editBtn} onClick={() => setEditing(true)}>
                    <Pencil size={16} /> 수정
                  </button>
                )}
                {profile && editing && (
                  <button type="button" className={styles.cancelBtn} onClick={() => setEditing(false)}>
                    <X size={16} /> 취소
                  </button>
                )}
              </div>
              {profileError && <p className={styles.profileError}>{profileError}</p>}
              {profileLoading ? (
                <div className={styles.loading}>프로필 불러오는 중...</div>
              ) : profile ? (
                <>
                  <div className={styles.avatarWrap}>
                    <div className={styles.avatarFrame}>
                      {profileImageSrc ? (
                        <img src={profileImageSrc} alt="프로필" className={styles.avatarImg} />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          <User size={40} strokeWidth={1.5} />
                        </div>
                      )}
                      {editing && (
                        <label className={styles.avatarUploadLabel}>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleAvatarChange}
                            disabled={avatarUploading}
                            className={styles.avatarInput}
                          />
                          <span className={styles.avatarUploadBtn}>
                            {avatarUploading ? '업로드 중...' : '사진 변경'}
                          </span>
                        </label>
                      )}
                    </div>
                    <p className={styles.profileName}>
                      {profile.displayNickname || profile.name || profile.username}
                    </p>
                    <p className={styles.profileUsername}>@{profile.username}</p>
                  </div>
                  {editing ? (
                    <form
                      className={styles.profileForm}
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveProfile();
                      }}
                    >
                      <div className={styles.formRow}>
                        <label>아이디</label>
                        <span className={styles.readOnly}>{profile.username}</span>
                      </div>
                      <div className={styles.formRow}>
                        <label htmlFor="profile-name">이름</label>
                        <input
                          id="profile-name"
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="실명"
                        />
                      </div>
                      <div className={styles.formRow}>
                        <label htmlFor="profile-displayNickname">닉네임</label>
                        <input
                          id="profile-displayNickname"
                          type="text"
                          value={form.displayNickname}
                          onChange={(e) => setForm((f) => ({ ...f, displayNickname: e.target.value }))}
                          placeholder="서비스에서 보여질 이름"
                        />
                      </div>
                      <div className={styles.formRow}>
                        <label htmlFor="profile-email">이메일</label>
                        <input
                          id="profile-email"
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          placeholder="example@email.com"
                        />
                      </div>
                      <div className={styles.formRow}>
                        <label htmlFor="profile-birthDate">생년월일</label>
                        <input
                          id="profile-birthDate"
                          type="date"
                          value={form.birthDate}
                          onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
                        />
                      </div>
                      <div className={styles.formRow}>
                        <label htmlFor="profile-phone">핸드폰 번호</label>
                        <input
                          id="profile-phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                          placeholder="010-0000-0000"
                        />
                      </div>
                      <div className={styles.formRow}>
                        <label>권한</label>
                        <span className={styles.readOnly}>{profile.role}</span>
                      </div>
                      <button type="submit" className={styles.saveBtn} disabled={saving}>
                        {saving ? '저장 중...' : '저장'}
                      </button>
                    </form>
                  ) : (
                    <ul className={styles.profileList}>
                      <li><span>아이디</span><span>{profile.username}</span></li>
                      <li><span>이름</span><span>{profile.name || '-'}</span></li>
                      <li><span>닉네임</span><span>{profile.displayNickname || '-'}</span></li>
                      <li><span>이메일</span><span>{profile.email || '-'}</span></li>
                      <li><span>생년월일</span><span>{profile.birthDate || '-'}</span></li>
                      <li><span>핸드폰</span><span>{profile.phone || '-'}</span></li>
                      <li><span>권한</span><span>{profile.role}</span></li>
                    </ul>
                  )}
                </>
              ) : null}
            </section>
          )}

          {tab === 'orders' && (
            <section className={styles.dashboardSection}>
              <h2 className={styles.sectionTitle}>주문 내역</h2>
              {orders.length === 0 ? (
                <p className={styles.empty}>주문 내역이 없습니다.</p>
              ) : (
                <ul className={styles.orderList}>
                  {orders.map((o) => (
                    <li key={o.id}>
                      <Link href={`/user/orders/${o.id}`} className={styles.orderItem}>
                        <span>주문 #{o.id} · {o.totalAmount.toLocaleString()}원</span>
                        <span className={styles.orderStatus}>{o.status}</span>
                        <ChevronRight size={18} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {tab === 'coupons' && (
            <section className={`${styles.couponSection} ${styles.dashboardSection}`}>
              <div className={styles.loyaltyCardWrap}>
                <div className={styles.loyaltyCardImage} style={{ backgroundImage: `url(/images/coupon/stamp-${Math.min(stamps?.stampCount ?? 0, 10)}.png)` }} />
                <div className={styles.loyaltyCardOverlay}>
                  <p className={styles.loyaltyStampText}>
                    스탬프 <strong>{stamps?.stampCount ?? 0}</strong> / {stamps?.requiredForReward ?? 10}
                  </p>
                  <p className={styles.loyaltyHint}>커피 1잔당 스탬프 1개 적립 ✨</p>
                  <p className={styles.loyaltyReward}>10개 모이면 아메리카노 가격까지 무료!</p>
                </div>
              </div>
              <h2 className={styles.sectionTitle}>보유 쿠폰</h2>
              {coupons.length === 0 ? (
                <p className={styles.empty}>보유 쿠폰이 없습니다.</p>
              ) : (
                <ul className={styles.couponList}>
                  {coupons.map((c) => (
                    <li key={c.id} className={c.usedAt ? styles.used : ''}>
                      <span>{c.couponName ?? '쿠폰'}</span>
                      <span>{c.usedAt ? '사용완료' : '사용가능'}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className={styles.couponRegisterWrap}>
                <label htmlFor="coupon-code" className={styles.couponRegisterLabel}>쿠폰 등록</label>
                <div className={styles.couponRegisterRow}>
                  <input
                    id="coupon-code"
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="쿠폰 코드를 입력하세요"
                    className={styles.couponRegisterInput}
                    disabled={couponRedeeming}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleRedeemCoupon();
                      }
                    }}
                  />
                  <button type="button" className={styles.couponRegisterBtn} onClick={handleRedeemCoupon} disabled={couponRedeeming}>
                    {couponRedeeming ? '등록 중...' : '등록'}
                  </button>
                </div>
                {couponRedeemMessage && <p className={styles.couponRedeemMessage}>{couponRedeemMessage}</p>}
              </div>
            </section>
          )}

          {tab === 'favorites' && (
            <section className={styles.dashboardSection}>
              <h2 className={styles.sectionTitle}>찜한 목록</h2>
              {favoritesLoading ? (
                <div className={styles.loading}>찜 목록을 불러오는 중...</div>
              ) : favorites.length === 0 ? (
                <p className={styles.empty}>찜한 메뉴가 없습니다.</p>
              ) : (
                <ul className={styles.favoriteList}>
                  {favorites.map((f) => {
                    const menu = favoritesMenus[f.menuId];
                    const name = menu?.korName ?? menu?.name ?? `메뉴 #${f.menuId}`;
                    return (
                      <li key={f.id}>
                        <Link href={`/menus/${f.menuId}`} className={styles.favoriteItem}>
                          <span className={styles.favoriteName}>{name}</span>
                          {menu?.price != null && (
                            <span className={styles.favoritePrice}>{menu.price.toLocaleString()}원</span>
                          )}
                          <ChevronRight size={18} />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}

          {tab === 'inquiries' && (
            <section className={styles.dashboardSection}>
              <h2 className={styles.sectionTitle}>1:1 문의 작성 내역</h2>
              {inquiriesLoading ? (
                <div className={styles.loading}>문의 목록을 불러오는 중...</div>
              ) : inquiries.length === 0 ? (
                <p className={styles.empty}>작성한 문의가 없습니다.</p>
              ) : (
                <ul className={styles.inquiryList}>
                  {inquiries.map((inq) => (
                    <li key={inq.id}>
                      <Link href={`/inquiries/${inq.id}`} className={styles.inquiryItem}>
                        <span className={inq.isPrivate ? styles.inquiryPrivate : ''}>
                          {inq.isPrivate ? '[비밀] ' : ''}{inq.title}
                        </span>
                        <span className={styles.inquiryDate}>
                          {new Date(inq.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                        <ChevronRight size={18} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <p className={styles.inquiryHint}>
                <Link href="/inquiries/new" className={styles.link}>새 문의 작성</Link>
              </p>
            </section>
          )}

          {tab === 'notifications' && (
            <section className={styles.dashboardSection}>
              <h2 className={styles.sectionTitle}>알림 받은 내역</h2>
              {notificationsLoading ? (
                <div className={styles.loading}>알림을 불러오는 중...</div>
              ) : notifications.length === 0 ? (
                <p className={styles.empty}>받은 알림이 없습니다.</p>
              ) : (
                <ul className={styles.notificationList}>
                  {notifications.map((n) => (
                    <li key={n.id} className={n.readAt ? styles.notificationRead : ''}>
                      <div className={styles.notificationItem}>
                        <div className={styles.notificationHead}>
                          <span className={styles.notificationTitle}>{n.title ?? n.message ?? '알림'}</span>
                          <span className={styles.notificationDate}>
                            {new Date(n.createdAt).toLocaleString('ko-KR')}
                          </span>
                        </div>
                        {n.message && n.title !== n.message && (
                          <p className={styles.notificationMessage}>{n.message}</p>
                        )}
                        {!n.readAt && (
                          <button
                            type="button"
                            className={styles.notificationMarkRead}
                            onClick={async () => {
                              try {
                                await markNotificationRead(n.id);
                                setNotifications((prev) =>
                                  prev.map((x) =>
                                    x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x
                                  )
                                );
                              } catch {}
                            }}
                          >
                            읽음 처리
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      ) : null}

      <div className={styles.footer}>
        <Link href="/menus" className={styles.link}>메뉴 보기</Link>
        <Link href="/cart" className={styles.link}>장바구니</Link>
      </div>
    </PageWithHero>
  );
}

export default function UserPage() {
  return (
    <Suspense fallback={<PageWithHero title="마이페이지" subtitle="주문 내역, 찜, 문의, 알림을 확인하세요."><div className={styles.loading}>불러오는 중...</div></PageWithHero>}>
      <UserPageContent />
    </Suspense>
  );
}
