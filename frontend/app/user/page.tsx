'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Package, Ticket, ChevronRight, ChevronLeft, Pencil, X, Heart, MessageCircle, Bell, Trash2, ShoppingCart, CreditCard } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getMyOrders } from '@/services/orderService';
import {
  getUserStamps,
  getUserCoupons,
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  changePassword,
  redeemCouponCode,
  type StampsDto,
  type UserCouponDto,
  type UserProfileDto,
} from '@/services/userService';
import { getApiBase } from '@/services/api';
import { menuImageUrl } from '@/utils/menuImageUrl';
import AddressField from '@/components/AddressField/AddressField';
import { validateAddress, validateAddressDetail } from '@/lib/addressValidation';
import type { OrderDto } from '@/services/orderService';
import { getFavorites, type FavoriteDto } from '@/services/favoriteService';
import { getMyInquiries, deleteInquiry, type InquiryDto } from '@/services/inquiryService';
import { getMyNotifications, markNotificationRead, deleteNotification, type NotificationDto } from '@/services/notificationService';
import { useCart } from '@/contexts/CartContext';
import PageWithHero from '@/components/PageWithHero/PageWithHero';
import styles from './page.module.css';

type Tab = 'profile' | 'orders' | 'coupons' | 'favorites' | 'inquiries' | 'notifications';

const TAB_IDS: Tab[] = ['profile', 'orders', 'coupons', 'favorites', 'inquiries', 'notifications'];

function getInitialTab(searchParams: ReturnType<typeof useSearchParams>): Tab | null {
  const tabParam = searchParams.get('tab');
  return tabParam && TAB_IDS.includes(tabParam as Tab) ? (tabParam as Tab) : null;
}

type OrderStatusFilter = 'all' | 'PAID' | 'CANCELLED';
const ORDER_ITEMS_PER_PAGE = 5;

function getOrderStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING': return '대기 중';
    case 'PAID': return '결제완료';
    case 'CANCELLED': return '취소됨';
    default: return status;
  }
}

function getOrderStatusClass(status: string, styles: { [k: string]: string }): string {
  switch (status) {
    case 'PENDING': return styles.orderTabStatusPending;
    case 'PAID': return styles.orderTabStatusPaid;
    case 'CANCELLED': return styles.orderTabStatusCancelled;
    default: return styles.orderTabStatusDefault;
  }
}

function formatOrderDate(createdAt: string): string {
  try {
    const d = new Date(createdAt);
    return d.toISOString().slice(0, 10);
  } catch {
    return createdAt?.slice(0, 10) ?? '-';
  }
}

function getOrderMonthRange(monthsBack: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to.getFullYear(), to.getMonth() - monthsBack, 1);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

/* 프로필/회원가입 동일 유효성 검사 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const NICKNAME_REGEX = /^[a-zA-Z0-9가-힣_]{2,20}$/;
function isValidBirthDate(value: string): boolean {
  if (!value || value.length !== 8) return false;
  const y = parseInt(value.slice(0, 4), 10);
  const m = parseInt(value.slice(4, 6), 10);
  const d = parseInt(value.slice(6, 8), 10);
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1) return false;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function UserPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, sessionChecked, setUser, setProfileImageUrl, profileImageUrl: storeProfileImageUrl } = useAuthStore();
  const { addItem } = useCart();
  const [tab, setTab] = useState<Tab | null>(() => getInitialTab(searchParams));
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [stamps, setStamps] = useState<StampsDto | null>(null);
  const [coupons, setCoupons] = useState<UserCouponDto[]>([]);
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', birthDate: '', phone: '', address: '', addressDetail: '', displayNickname: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteDto[]>([]);
  const [favoritesMenus, setFavoritesMenus] = useState<Record<number, {
    korName?: string;
    name?: string;
    price?: number;
    imageSrc?: string | null;
    description?: string | null;
    categoryName?: string | null;
    badgeTypes?: string[];
  }>>({});
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [inquiries, setInquiries] = useState<InquiryDto[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponRedeemMessage, setCouponRedeemMessage] = useState<string | null>(null);
  const [couponRedeeming, setCouponRedeeming] = useState(false);
  const [orderFilter, setOrderFilter] = useState<OrderStatusFilter>('all');
  const [orderDateRange, setOrderDateRange] = useState(() => getOrderMonthRange(1));
  const [orderSortRecent, setOrderSortRecent] = useState(true);
  const [orderPage, setOrderPage] = useState(1);
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordNewConfirm, setPasswordNewConfirm] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordChanging, setPasswordChanging] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    setTab(tabParam && TAB_IDS.includes(tabParam as Tab) ? (tabParam as Tab) : null);
  }, [searchParams]);

  useEffect(() => {
    if (!sessionChecked) return;
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
  }, [sessionChecked, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || tab !== 'favorites') return;
    setFavoritesLoading(true);
    getFavorites()
      .then(async (list) => {
        setFavorites(list);
        const res = await fetch(`${getApiBase()}/menus`, { credentials: 'include' });
        const data = await res.json();
        const menuList = data.menus ?? data ?? [];
        const map: Record<number, {
          korName?: string;
          name?: string;
          price?: number;
          imageSrc?: string | null;
          description?: string | null;
          categoryName?: string | null;
          badgeTypes?: string[];
        }> = {};
        (Array.isArray(menuList) ? menuList : []).forEach((m: {
          id: number;
          korName?: string;
          name?: string;
          price?: number;
          imageSrc?: string | null;
          description?: string | null;
          categoryName?: string | null;
          badgeTypes?: string[];
        }) => {
          map[m.id] = {
            korName: m.korName,
            name: m.name,
            price: m.price,
            imageSrc: m.imageSrc,
            description: m.description,
            categoryName: m.categoryName,
            badgeTypes: m.badgeTypes,
          };
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
            birthDate: (p.birthDate ?? '').replace(/\D/g, '').slice(0, 8),
            phone: p.phone ?? '',
            address: p.address ?? '',
            addressDetail: '',
            displayNickname: p.displayNickname ?? '',
          });
        })
        .catch((e) => setProfileError(e instanceof Error ? e.message : '프로필을 불러올 수 없습니다.'))
        .finally(() => setProfileLoading(false));
    }
  }, [isAuthenticated, profile, profileLoading]);

  const validateProfileForm = (): Record<string, string> => {
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = '이름을 입력해주세요.';
    const emailVal = form.email.trim();
    if (emailVal && !EMAIL_REGEX.test(emailVal)) err.email = '올바른 이메일 형식을 입력해주세요.';
    const birthVal = form.birthDate.replace(/\D/g, '');
    if (birthVal && (birthVal.length !== 8 || !isValidBirthDate(birthVal))) err.birthDate = '생년월일을 8자리 숫자로 입력해주세요. (예: 19880301)';
    const phoneVal = form.phone.replace(/\D/g, '');
    if (!phoneVal) err.phone = '핸드폰 번호를 입력해주세요.';
    else if (phoneVal.length < 10 || phoneVal.length > 11 || !phoneVal.startsWith('01')) err.phone = '올바른 휴대폰 번호를 입력해주세요. (010으로 시작, 10~11자리 숫자)';
    const nickVal = form.displayNickname.trim();
    if (nickVal && (nickVal.length < 2 || nickVal.length > 20 || !NICKNAME_REGEX.test(nickVal))) err.displayNickname = '닉네임은 영문, 한글, 숫자, _ 만 사용 가능합니다. (2~20자)';
    const addrErr = validateAddress(form.address, { required: false });
    if (addrErr) err.address = addrErr;
    const detailErr = validateAddressDetail(form.addressDetail);
    if (detailErr) err.addressDetail = detailErr;
    return err;
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    const errors = validateProfileForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setSaving(true);
    setProfileError(null);
    try {
      const birthDigits = form.birthDate.replace(/\D/g, '');
      const birthDateValue = birthDigits.length === 8
        ? `${birthDigits.slice(0, 4)}-${birthDigits.slice(4, 6)}-${birthDigits.slice(6, 8)}`
        : (form.birthDate.trim() || null);
      const updated = await updateUserProfile({
        name: form.name.trim() || undefined,
        email: form.email.trim() || undefined,
        birthDate: birthDateValue,
        phone: form.phone.trim() || undefined,
        address: [form.address.trim(), form.addressDetail.trim()].filter(Boolean).join(' ') || null,
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    if (!passwordCurrent.trim()) {
      setPasswordError('현재 비밀번호를 입력해주세요.');
      return;
    }
    if (passwordNew.length < 6) {
      setPasswordError('새 비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (!/.*[0-9].*/.test(passwordNew) || !/.*[a-zA-Z].*/.test(passwordNew)) {
      setPasswordError('새 비밀번호는 영문과 숫자를 모두 포함해야 합니다.');
      return;
    }
    if (passwordNew !== passwordNewConfirm) {
      setPasswordError('새 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    setPasswordChanging(true);
    try {
      await changePassword(passwordCurrent, passwordNew);
      setPasswordSuccess('비밀번호가 변경되었습니다.');
      setPasswordCurrent('');
      setPasswordNew('');
      setPasswordNewConfirm('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.');
    } finally {
      setPasswordChanging(false);
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

  const TAB_LIST: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: 'orders', icon: <Package size={22} />, label: '주문내역' },
    { id: 'coupons', icon: <Ticket size={22} />, label: '쿠폰/스탬프' },
    { id: 'favorites', icon: <Heart size={22} />, label: '찜한 목록' },
    { id: 'inquiries', icon: <MessageCircle size={22} />, label: '1:1 문의' },
    { id: 'notifications', icon: <Bell size={22} />, label: '알림' },
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

  const orderFiltered = useMemo(() => {
    let list = [...orders];
    if (orderFilter === 'PAID') list = list.filter((o) => o.status === 'PAID');
    else if (orderFilter === 'CANCELLED') list = list.filter((o) => o.status === 'CANCELLED');
    try {
      const from = new Date(orderDateRange.from).getTime();
      const to = new Date(orderDateRange.to).getTime() + 86400000;
      list = list.filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return t >= from && t < to;
      });
    } catch {
      /* ignore */
    }
    list.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return orderSortRecent ? tb - ta : ta - tb;
    });
    return list;
  }, [orders, orderFilter, orderDateRange, orderSortRecent]);

  const orderTotalPages = Math.max(1, Math.ceil(orderFiltered.length / ORDER_ITEMS_PER_PAGE));
  const orderCurrentPage = Math.min(orderPage, orderTotalPages);
  const orderSlice = useMemo(
    () => orderFiltered.slice((orderCurrentPage - 1) * ORDER_ITEMS_PER_PAGE, orderCurrentPage * ORDER_ITEMS_PER_PAGE),
    [orderFiltered, orderCurrentPage]
  );

  const orderCountAll = orders.length;
  const orderCountPaid = orders.filter((o) => o.status === 'PAID').length;
  const orderCountCancelled = orders.filter((o) => o.status === 'CANCELLED').length;

  const needsInitialLoad = tab !== null && loading && ['orders', 'coupons'].includes(tab);

  if (!sessionChecked) {
    return (
      <PageWithHero title="마이페이지" subtitle="주문 내역, 찜, 문의, 알림을 확인하세요." mainClassName={styles.userPageMain}>
        <div className={styles.loading}>불러오는 중...</div>
      </PageWithHero>
    );
  }
  if (!isAuthenticated) return null;

  return (
    <PageWithHero title="마이페이지" subtitle="주문 내역, 찜, 문의, 알림을 확인하세요." mainClassName={styles.userPageMain}>
      <div className={styles.dashboard}>
        <div className={styles.dashboardProfile}>
          <div className={styles.dashboardProfileAvatar}>
            {profileImageSrc ? (
              <img src={profileImageSrc} alt="" className={styles.dashboardProfileImg} />
            ) : (
              <span className={styles.dashboardProfilePlaceholder} aria-hidden><User size={32} strokeWidth={1.5} /></span>
            )}
          </div>
          <div className={styles.dashboardProfileText}>
            <span className={styles.dashboardProfileId}>{profile?.username ?? user?.username ?? '-'}</span>
            <span className={styles.dashboardProfileNickname}>{displayName}</span>
          </div>
          <Link href="/user?tab=profile" className={styles.dashboardProfileBtn}>프로필 이동</Link>
        </div>
        <nav className={styles.dashboardCategoryRow} aria-label="마이페이지 메뉴">
          {TAB_LIST.map(({ id, icon, label }) => (
            <Link
              key={id}
              href={`/user?tab=${id}`}
              className={tab === id ? styles.dashboardCategoryCardActive : styles.dashboardCategoryCard}
              aria-current={tab === id ? 'page' : undefined}
            >
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
          {tab === 'profile' && (
            <section className={`${styles.profileSection} ${styles.dashboardSection}`}>
              <div className={styles.profileSectionHeader}>
                <h2 className={styles.profileSectionTitle}>프로필</h2>
                {profile && !editing && (
                  <button type="button" className={styles.editBtn} onClick={() => setEditing(true)}>
                    <Pencil size={16} /> 수정
                  </button>
                )}
                {profile && editing && (
                  <button type="button" className={styles.cancelBtn} onClick={() => { setEditing(false); setFormErrors({}); }}>
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
                    <p className={styles.profileNickname}>
                      {profile.displayNickname || profile.name || profile.username}
                    </p>
                    <p className={styles.profileUsername}>{profile.username}</p>
                  </div>
                  {editing ? (
                    <>
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
                          onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setFormErrors((prev) => ({ ...prev, name: '' })); }}
                          placeholder="실명"
                          className={formErrors.name ? styles.inputError : ''}
                        />
                        {formErrors.name && <span className={styles.fieldError}>{formErrors.name}</span>}
                      </div>
                      <div className={styles.formRow}>
                        <label htmlFor="profile-displayNickname">닉네임</label>
                        <input
                          id="profile-displayNickname"
                          type="text"
                          value={form.displayNickname}
                          onChange={(e) => { setForm((f) => ({ ...f, displayNickname: e.target.value })); setFormErrors((prev) => ({ ...prev, displayNickname: '' })); }}
                          placeholder="서비스에서 보여질 이름 (2~20자)"
                          className={formErrors.displayNickname ? styles.inputError : ''}
                        />
                        {formErrors.displayNickname && <span className={styles.fieldError}>{formErrors.displayNickname}</span>}
                      </div>
                      <div className={styles.formRow}>
                        <label htmlFor="profile-email">이메일</label>
                        <input
                          id="profile-email"
                          type="email"
                          value={form.email}
                          onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setFormErrors((prev) => ({ ...prev, email: '' })); }}
                          placeholder="example@email.com"
                          className={formErrors.email ? styles.inputError : ''}
                        />
                        {formErrors.email && <span className={styles.fieldError}>{formErrors.email}</span>}
                      </div>
                      <div className={styles.formRow}>
                        <label htmlFor="profile-birthDate">생년월일</label>
                        <input
                          id="profile-birthDate"
                          type="text"
                          inputMode="numeric"
                          maxLength={8}
                          value={form.birthDate}
                          onChange={(e) => {
                            const next = e.target.value.replace(/\D/g, '').slice(0, 8);
                            setForm((f) => ({ ...f, birthDate: next }));
                            setFormErrors((prev) => ({ ...prev, birthDate: '' }));
                          }}
                          placeholder="예: 19880301 (8자리 숫자)"
                          className={formErrors.birthDate ? styles.inputError : ''}
                        />
                        {formErrors.birthDate && <span className={styles.fieldError}>{formErrors.birthDate}</span>}
                      </div>
                      <div className={styles.formRow}>
                        <label htmlFor="profile-phone">핸드폰 번호</label>
                        <input
                          id="profile-phone"
                          type="tel"
                          inputMode="numeric"
                          value={form.phone}
                          onChange={(e) => {
                            const next = e.target.value.replace(/\D/g, '').slice(0, 11);
                            setForm((f) => ({ ...f, phone: next }));
                            setFormErrors((prev) => ({ ...prev, phone: '' }));
                          }}
                          placeholder="예: 01039079055 (숫자만 10~11자리)"
                          className={formErrors.phone ? styles.inputError : ''}
                        />
                        {formErrors.phone && <span className={styles.fieldError}>{formErrors.phone}</span>}
                      </div>
                      <div className={styles.formRow}>
                        <label htmlFor="profile-address">주소</label>
                        <AddressField
                          address={form.address}
                          addressDetail={form.addressDetail}
                          onAddressChange={(v) => { setForm((f) => ({ ...f, address: v })); setFormErrors((prev) => ({ ...prev, address: '' })); }}
                          onAddressDetailChange={(v) => { setForm((f) => ({ ...f, addressDetail: v })); setFormErrors((prev) => ({ ...prev, addressDetail: '' })); }}
                          error={formErrors.address || null}
                          addressDetailError={formErrors.addressDetail || null}
                          showDetail={true}
                          disabled={saving}
                          id="profile-address"
                          detailId="profile-addressDetail"
                          className={styles.addressFieldWrap}
                        />
                      </div>
                      <div className={styles.formRow}>
                        <label>권한</label>
                        <span className={styles.readOnly}>{profile.role}</span>
                      </div>
                      <div className={styles.saveBtnWrap}>
                        <button type="submit" className={styles.saveBtn} disabled={saving}>
                          {saving ? '저장 중...' : '저장'}
                        </button>
                      </div>
                    </form>
                    <div className={styles.passwordChangeWrap}>
                      <h3 className={styles.passwordChangeTitle}>비밀번호 변경</h3>
                      <form onSubmit={handleChangePassword} className={styles.passwordChangeForm}>
                        <div className={styles.formRow}>
                          <label htmlFor="user-current-password">현재 비밀번호</label>
                          <input
                            id="user-current-password"
                            type="password"
                            value={passwordCurrent}
                            onChange={(e) => { setPasswordCurrent(e.target.value); setPasswordError(null); }}
                            placeholder="현재 비밀번호"
                            autoComplete="current-password"
                            className={passwordError ? styles.inputError : ''}
                          />
                        </div>
                        <div className={styles.formRow}>
                          <label htmlFor="user-new-password">새 비밀번호</label>
                          <input
                            id="user-new-password"
                            type="password"
                            value={passwordNew}
                            onChange={(e) => { setPasswordNew(e.target.value); setPasswordError(null); }}
                            placeholder="6자 이상, 영문·숫자 포함"
                            autoComplete="new-password"
                            className={passwordError ? styles.inputError : ''}
                          />
                        </div>
                        <div className={styles.formRow}>
                          <label htmlFor="user-new-password-confirm">새 비밀번호 확인</label>
                          <input
                            id="user-new-password-confirm"
                            type="password"
                            value={passwordNewConfirm}
                            onChange={(e) => { setPasswordNewConfirm(e.target.value); setPasswordError(null); }}
                            placeholder="새 비밀번호 다시 입력"
                            autoComplete="new-password"
                            className={passwordError ? styles.inputError : ''}
                          />
                        </div>
                        {passwordError && <p className={styles.fieldError}>{passwordError}</p>}
                        {passwordSuccess && <p className={styles.passwordSuccess}>{passwordSuccess}</p>}
                        <div className={styles.saveBtnWrap}>
                          <button type="submit" className={styles.saveBtn} disabled={passwordChanging}>
                            {passwordChanging ? '변경 중...' : '비밀번호 변경'}
                          </button>
                        </div>
                      </form>
                    </div>
                    </>
                  ) : (
                    <ul className={styles.profileList}>
                      <li><span>아이디</span><span>{profile.username}</span></li>
                      <li><span>이름</span><span>{profile.name || '-'}</span></li>
                      <li><span>닉네임</span><span>{profile.displayNickname || '-'}</span></li>
                      <li><span>이메일</span><span>{profile.email || '-'}</span></li>
                      <li><span>생년월일</span><span>{profile.birthDate || '-'}</span></li>
                    <li><span>핸드폰</span><span>{profile.phone || '-'}</span></li>
                    <li><span>주소</span><span>{profile.address || '-'}</span></li>
                    <li><span>권한</span><span>{profile.role}</span></li>
                    </ul>
                  )}
                </>
              ) : null}
            </section>
          )}

          {tab === 'orders' && (
            <section className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>주문 내역</h2>
                <span className={styles.sectionCount}>총 {orders.length}건</span>
              </div>
              <div className={styles.orderTabToolbar}>
                <div className={styles.orderTabFilters}>
                  <button
                    type="button"
                    className={orderFilter === 'all' ? styles.orderTabFilterActive : styles.orderTabFilterBtn}
                    onClick={() => { setOrderFilter('all'); setOrderPage(1); }}
                  >
                    전체 ({orderCountAll})
                  </button>
                  <button
                    type="button"
                    className={orderFilter === 'PAID' ? styles.orderTabFilterActive : styles.orderTabFilterBtn}
                    onClick={() => { setOrderFilter('PAID'); setOrderPage(1); }}
                  >
                    결제완료 ({orderCountPaid})
                  </button>
                  <button
                    type="button"
                    className={orderFilter === 'CANCELLED' ? styles.orderTabFilterActive : styles.orderTabFilterBtn}
                    onClick={() => { setOrderFilter('CANCELLED'); setOrderPage(1); }}
                  >
                    취소된 주문 ({orderCountCancelled})
                  </button>
                </div>
                <div className={styles.orderTabControls}>
                  <div className={styles.orderTabDateRangeWrap}>
                    <input
                      type="date"
                      className={styles.orderTabDateInput}
                      value={orderDateRange.from}
                      onChange={(e) => { setOrderDateRange((r) => ({ ...r, from: e.target.value })); setOrderPage(1); }}
                      aria-label="시작일"
                    />
                    <span className={styles.orderTabDateRangeSep}>~</span>
                    <input
                      type="date"
                      className={styles.orderTabDateInput}
                      value={orderDateRange.to}
                      onChange={(e) => { setOrderDateRange((r) => ({ ...r, to: e.target.value })); setOrderPage(1); }}
                      aria-label="종료일"
                    />
                  </div>
                  <select
                    className={styles.orderTabSortSelect}
                    value={orderSortRecent ? 'recent' : 'old'}
                    onChange={(e) => { setOrderSortRecent(e.target.value === 'recent'); setOrderPage(1); }}
                  >
                    <option value="recent">최근 주문 순</option>
                    <option value="old">과거 주문 순</option>
                  </select>
                </div>
              </div>
              <div className={styles.sectionListBlock}>
                {orderSlice.length === 0 ? (
                  <p className={styles.empty}>주문 내역이 없습니다.</p>
                ) : (
                  <>
                    <ul className={styles.orderTabCardList}>
                      {orderSlice.map((o) => (
                        <li key={o.id} className={styles.orderTabCard}>
                          <div className={styles.orderTabCardRow}>
                            <span className={styles.orderTabOrderNumber}>
                              주문번호: {o.orderNumber ?? `ORD-${o.id}`}
                            </span>
                            <span className={`${styles.orderTabStatusTag} ${getOrderStatusClass(o.status, styles)}`}>
                              {getOrderStatusLabel(o.status)}
                            </span>
                          </div>
                          <p className={styles.orderTabOrderDate}>주문일자: {formatOrderDate(o.createdAt)}</p>
                          <div className={styles.orderTabCardFooter}>
                            <span className={styles.orderTabTotalAmount}>
                              총 금액: ₩{(o.totalPrice ?? o.totalAmount)?.toLocaleString() ?? '0'}
                            </span>
                            <Link href={`/user/orders/${Number(o.id)}`} className={styles.orderTabDetailBtn} scroll={true}>
                              주문 상세보기
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {orderTotalPages > 1 && (
                      <nav className={styles.orderTabPagination} aria-label="주문 목록 페이지">
                        <button
                          type="button"
                          className={styles.orderTabPageBtn}
                          disabled={orderCurrentPage <= 1}
                          onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                        >
                          <ChevronLeft size={18} />
                        </button>
                        {Array.from({ length: orderTotalPages }, (_, i) => i + 1).map((n) => (
                          <button
                            key={n}
                            type="button"
                            className={n === orderCurrentPage ? styles.orderTabPageBtnActive : styles.orderTabPageBtn}
                            onClick={() => setOrderPage(n)}
                          >
                            {n}
                          </button>
                        ))}
                        <button
                          type="button"
                          className={styles.orderTabPageBtn}
                          disabled={orderCurrentPage >= orderTotalPages}
                          onClick={() => setOrderPage((p) => Math.min(orderTotalPages, p + 1))}
                        >
                          <ChevronRight size={18} />
                        </button>
                      </nav>
                    )}
                    <p className={styles.orderListMore}>
                      <Link href="/user?tab=orders" className={styles.orderListLink}>전체 주문 내역 보기 ({orders.length}건)</Link>
                    </p>
                  </>
                )}
              </div>
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
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>보유 쿠폰</h2>
                <span className={styles.sectionCount}>총 {coupons.length}개</span>
              </div>
              <div className={styles.sectionListBlock}>
              {coupons.length === 0 ? (
                <p className={styles.empty}>보유 쿠폰이 없습니다.</p>
              ) : (
                <div className={styles.couponTableWrap}>
                  <table className={styles.couponTable}>
                    <thead>
                      <tr>
                        <th>순서</th>
                        <th>쿠폰코드</th>
                        <th>유효기간</th>
                        <th>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((c, index) => {
                        const validUntil = c.validUntil ? new Date(c.validUntil) : null;
                        const isExpired = validUntil != null && new Date() > validUntil;
                        const isUsed = !!c.usedAt;
                        const isInactive = isUsed || isExpired;
                        const statusText = isUsed ? '사용완료' : isExpired ? '만료됨' : '사용가능';
                        return (
                          <tr key={c.id} className={isInactive ? styles.couponRowInactive : ''}>
                            <td>{index + 1}</td>
                            <td>{c.couponCode ?? c.couponName ?? '-'}</td>
                            <td>{validUntil ? validUntil.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-'}</td>
                            <td><span className={isInactive ? styles.couponStatusInactive : styles.couponStatusActive}>{statusText}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              </div>
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
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>찜한 목록</h2>
                <span className={styles.sectionCount}>총 {favorites.length}개</span>
              </div>
              <div className={styles.sectionListBlock}>
              {favoritesLoading ? (
                <div className={styles.loading}>찜 목록을 불러오는 중...</div>
              ) : favorites.length === 0 ? (
                <p className={styles.empty}>찜한 메뉴가 없습니다.</p>
              ) : (
                <ul className={styles.favoriteList}>
                  {favorites.map((f) => {
                    const menu = favoritesMenus[f.menuId];
                    const name = menu?.korName ?? menu?.name ?? `메뉴 #${f.menuId}`;
                    const desc = menu?.description?.replace(/\s+/g, ' ').trim().slice(0, 60);
                    const addedDate = f.createdAt ? new Date(f.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
                    const isPopular = Array.isArray(menu?.badgeTypes) && menu.badgeTypes.includes('popular');
                    return (
                      <li key={f.id} className={styles.favoriteListItem}>
                        <Link href={`/menus/${f.menuId}`} className={styles.favoriteItem}>
                          <span className={styles.favoriteItemThumb} style={{ backgroundImage: `url(${menuImageUrl(menu?.imageSrc)})` }} aria-hidden />
                          <div className={styles.favoriteItemBody}>
                            <span className={styles.favoriteName}>{name}</span>
                            {menu?.price != null && (
                              <span className={styles.favoritePrice}>{menu.price.toLocaleString()}원</span>
                            )}
                            {desc && <p className={styles.favoriteItemDesc}>{desc}{(menu?.description?.length ?? 0) > 60 ? '…' : ''}</p>}
                            <div className={styles.favoriteItemMeta}>
                              {menu?.categoryName && <span className={styles.favoriteItemCategory}>{menu.categoryName}</span>}
                              {isPopular && <span className={styles.favoriteItemBadge}>인기</span>}
                              {addedDate && <span className={styles.favoriteItemDate}>추가 {addedDate}</span>}
                            </div>
                          </div>
                        </Link>
                        <div className={styles.favoriteItemActions}>
                          <button
                            type="button"
                            className={styles.favoriteActionBtn}
                            onClick={(e) => { e.preventDefault(); addItem(f.menuId, 1).catch(() => {}); }}
                            aria-label={`${name} 장바구니 담기`}
                          >
                            <ShoppingCart size={14} />
                            담기
                          </button>
                          <button
                            type="button"
                            className={styles.favoriteActionBtnPrimary}
                            onClick={(e) => {
                              e.preventDefault();
                              addItem(f.menuId, 1).then(() => router.push('/order')).catch(() => {});
                            }}
                            aria-label={`${name} 주문하기`}
                          >
                            <CreditCard size={14} />
                            주문
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              </div>
            </section>
          )}

          {tab === 'inquiries' && (
            <section className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>1:1 문의 작성 내역</h2>
                <span className={styles.sectionCount}>총 {inquiries.length}건</span>
              </div>
              <div className={styles.sectionListBlock}>
              {inquiriesLoading ? (
                <div className={styles.loading}>문의 목록을 불러오는 중...</div>
              ) : inquiries.length === 0 ? (
                <p className={styles.empty}>작성한 문의가 없습니다.</p>
              ) : (
                <ul className={styles.inquiryList}>
                  {inquiries.map((inq) => (
                    <li key={inq.id} className={styles.inquiryListItem}>
                      <Link href={`/inquiries/${inq.id}`} className={styles.inquiryItem}>
                        <span className={styles.inquiryItemTitle}>
                          <span className={inq.isPrivate ? styles.inquiryPrivate : ''}>
                            {inq.isPrivate ? '[비밀] ' : ''}{inq.title}
                          </span>
                        </span>
                        <span className={styles.inquiryMeta}>
                          {inq.inquiryType && (
                            <span className={styles.inquiryTypeBadge}>
                              {({ GENERAL: '일반', MENU: '메뉴', ORDER: '주문', STORE: '매장', ETC: '기타' } as Record<string, string>)[inq.inquiryType] ?? inq.inquiryType}
                            </span>
                          )}
                          {inq.hasReply && <span className={styles.inquiryAnswered}>답변완료</span>}
                          <span className={styles.inquiryDate}>
                            {new Date(inq.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                        </span>
                        <ChevronRight size={18} />
                      </Link>
                      <button
                        type="button"
                        className={styles.listItemDeleteBtn}
                        onClick={async (e) => {
                          e.preventDefault();
                          if (!confirm('이 문의를 삭제할까요?')) return;
                          try {
                            await deleteInquiry(inq.id);
                            setInquiries((prev) => prev.filter((i) => i.id !== inq.id));
                          } catch {}
                        }}
                        aria-label="문의 삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              </div>
              <p className={styles.inquiryHint}>
                <Link href="/inquiries/new" className={styles.link}>새 문의 작성</Link>
              </p>
            </section>
          )}

          {tab === 'notifications' && (
            <section className={styles.dashboardSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>알림 받은 내역</h2>
                <span className={styles.sectionCount}>총 {notifications.length}건</span>
              </div>
              <div className={styles.sectionListBlock}>
              {notificationsLoading ? (
                <div className={styles.loading}>알림을 불러오는 중...</div>
              ) : notifications.length === 0 ? (
                <p className={styles.empty}>받은 알림이 없습니다.</p>
              ) : (
                <ul className={styles.notificationList}>
                  {notifications.map((n) => (
                    <li key={n.id} className={n.readAt ? styles.notificationRead : styles.notificationUnread}>
                      <div className={styles.notificationItem}>
                        <div className={styles.notificationHead}>
                          <span className={styles.notificationTitle}>{n.title ?? n.message ?? '알림'}</span>
                          <span className={styles.notificationHeadRight}>
                            <span className={styles.notificationStatusBadge}>
                              {n.readAt ? '읽음' : '안 읽음'}
                            </span>
                            <span className={styles.notificationDate}>
                              {new Date(n.createdAt).toLocaleString('ko-KR')}
                            </span>
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
                      <button
                        type="button"
                        className={styles.listItemDeleteBtn}
                        onClick={async () => {
                          try {
                            await deleteNotification(n.id);
                            setNotifications((prev) => prev.filter((x) => x.id !== n.id));
                          } catch {}
                        }}
                        aria-label="알림 삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              </div>
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
