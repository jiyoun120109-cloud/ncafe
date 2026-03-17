'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CreditCard, Minus, Plus, Trash2, LogIn, User, Coffee, Ticket } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuthStore } from '@/stores/authStore';
import { createOrder, type OrderItemInput } from '@/services/orderService';
import { getUserProfile, getUserCoupons, type UserProfileDto, type UserCouponDto } from '@/services/userService';
import type { CartItemDto } from '@/services/cartService';
import CheckoutLayout from '@/components/CheckoutLayout/CheckoutLayout';
import CartItemOptionModal from '@/app/cart/_components/CartItemOptionModal';
import AddressField from '@/components/AddressField/AddressField';
import { menuImageUrl } from '@/utils/menuImageUrl';
import styles from './page.module.css';

function toOrderItems(items: CartItemDto[]): OrderItemInput[] {
  return items.map((it) => ({
    menuId: it.menuId,
    menuName: it.menuKorName,
    quantity: it.quantity,
    unitPrice: it.menuPrice,
    optionExtraPrice: it.optionExtraPrice ?? 0,
    optionsDisplay: it.optionsDisplay ?? null,
  }));
}

export default function OrderPage() {
  const router = useRouter();
  const { items, loading: cartLoading, updateQuantity, updateItemOptions, removeItem } = useCart();
  const { user, isAuthenticated, sessionChecked } = useAuthStore();
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [coupons, setCoupons] = useState<UserCouponDto[]>([]);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderAddress, setOrderAddress] = useState('');
  const [orderRequest, setOrderRequest] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('CARD');
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optionModalItem, setOptionModalItem] = useState<CartItemDto | null>(null);

  useEffect(() => {
    if (!sessionChecked || !isAuthenticated) return;
    setProfileLoading(true);
    getUserProfile()
      .then((p) => {
        setProfile(p);
        setOrderPhone(p.phone ?? '');
        setOrderAddress(p.address ?? '');
      })
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false));
  }, [sessionChecked, isAuthenticated]);

  useEffect(() => {
    if (!sessionChecked || !isAuthenticated) return;
    getUserCoupons()
      .then((list) => setCoupons(list.filter((c) => !c.usedAt)))
      .catch(() => setCoupons([]));
  }, [sessionChecked, isAuthenticated]);

  const totalPrice = items.reduce(
    (sum, it) => sum + (it.menuPrice + (it.optionExtraPrice ?? 0)) * it.quantity,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('장바구니가 비어 있습니다.');
      return;
    }
    if (!isAuthenticated && (!guestEmail.trim() || !guestPhone.trim())) {
      setError('비회원 주문 시 이메일과 연락처를 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        userId: isAuthenticated && user ? parseInt(user.id, 10) : null,
        guestEmail: isAuthenticated ? null : guestEmail.trim(),
        guestPhone: isAuthenticated ? null : (orderPhone.trim() || guestPhone.trim()),
        items: toOrderItems(items),
      };
      const result = await createOrder(payload);
      const query = selectedCouponId ? `&userCouponId=${selectedCouponId}` : '';
      router.push(`/payment?orderId=${result.orderId}${query}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '주문에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <CheckoutLayout currentStep="order">
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>장바구니를 불러오는 중...</p>
        </div>
      </CheckoutLayout>
    );
  }

  if (items.length === 0) {
    return (
      <CheckoutLayout currentStep="order">
        <div className={styles.emptyCard}>
          <p className={styles.emptyText}>장바구니가 비어 있어요.</p>
          <p className={styles.emptySub}>메뉴를 담은 후 주문을 진행해 주세요.</p>
          <Link href="/menus" className={styles.emptyCta}>메뉴 보기</Link>
          <Link href="/cart" className={styles.emptyLink}>장바구니로</Link>
        </div>
      </CheckoutLayout>
    );
  }

  return (
    <CheckoutLayout currentStep="order" wide>
      {!isAuthenticated && (
        <div className={styles.loginBanner}>
          <LogIn size={18} />
          <span>
            회원이시면 <Link href={`/login?returnUrl=${encodeURIComponent('/order')}`} className={styles.loginLink}>로그인</Link> 후 주문하시면 주문 내역을 확인할 수 있어요.
          </span>
        </div>
      )}

      <div className={styles.orderWrap}>
        <div className={styles.grid}>
          {/* 왼쪽: 상품내역 (카드 전체 펼침) */}
          <div className={styles.leftCol}>
            <div className={styles.card}>
              <h2 className={styles.cardTitleStatic}>
                <Coffee size={20} />
                상품내역
              </h2>
              <ul className={styles.itemList}>
                {items.map((item) => {
                  const unitPrice = item.menuPrice + (item.optionExtraPrice ?? 0);
                  const lineTotal = unitPrice * item.quantity;
                  const soldOut = Boolean(item.isSoldOut);
                  const detailHref = `/menus/${item.menuId}`;
                  return (
                    <li key={item.id} className={`${styles.item} ${soldOut ? styles.itemSoldOut : ''}`}>
                      <Link href={detailHref} className={styles.itemThumb} aria-label={`${item.menuKorName} 상세`}>
                        <Image
                          src={menuImageUrl(item.menuImageUrl)}
                          alt={item.menuKorName}
                          width={72}
                          height={72}
                          className={styles.itemImage}
                        />
                      </Link>
                      <div className={styles.itemBody}>
                        <div className={styles.itemTop}>
                          <Link href={detailHref} className={styles.itemName}>{item.menuKorName}</Link>
                          {!soldOut && (
                            <button type="button" className={styles.removeBtn} aria-label="삭제" onClick={() => removeItem(item.id)}>
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                        {item.optionsDisplay && <p className={styles.itemOptions}>{item.optionsDisplay}</p>}
                        {!soldOut && (
                          <button type="button" className={styles.optionChangeBtn} onClick={() => setOptionModalItem(item)}>
                            옵션변경
                          </button>
                        )}
                        <div className={styles.itemPriceRow}>
                          <span className={styles.unitPrice}>{unitPrice.toLocaleString()}원</span>
                          <div className={styles.quantity}>
                            <button type="button" aria-label="수량 줄이기" disabled={soldOut} onClick={() => !soldOut && updateQuantity(item.id, Math.max(1, item.quantity - 1))}>
                              <Minus size={14} />
                            </button>
                            <span>{item.quantity}</span>
                            <button type="button" aria-label="수량 늘리기" disabled={soldOut} onClick={() => !soldOut && updateQuantity(item.id, item.quantity + 1)}>
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className={styles.itemSubtotal}>{lineTotal.toLocaleString()}원</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* 오른쪽 위: 사용자정보, 오른쪽 아래: 결제방법 */}
          <div className={styles.rightCol}>
            <div className={styles.card}>
              <h2 className={styles.cardTitleStatic}>
                <User size={20} />
                사용자 정보
              </h2>
              <div className={styles.cardBodyStatic}>
                {profileLoading ? (
                  <p className={styles.muted}>불러오는 중...</p>
                ) : isAuthenticated && profile ? (
                  <div className={styles.userFields}>
                    <div className={styles.userLine}>
                      <span className={styles.userLineLabel}>이름</span>
                      <span className={styles.userLineValue}>{profile.name || '-'}</span>
                    </div>
                    <div className={styles.userLine}>
                      <span className={styles.userLineLabel}>닉네임</span>
                      <span className={styles.userLineValue}>{profile.displayNickname || '-'}</span>
                    </div>
                    <div className={styles.userLine}>
                      <span className={styles.userLineLabel}>아이디</span>
                      <span className={styles.userLineValue}>{profile.username}</span>
                    </div>
                    <div className={styles.fieldRow}>
                      <label className={styles.fieldLabel} htmlFor="order-phone">핸드폰 번호</label>
                      <input
                        id="order-phone"
                        type="tel"
                        className={styles.input}
                        value={orderPhone}
                        onChange={(e) => setOrderPhone(e.target.value)}
                        placeholder="010-0000-0000"
                      />
                    </div>
                    <div className={styles.fieldRow}>
                      <label className={styles.fieldLabel} htmlFor="order-address">주소</label>
                      <AddressField
                        address={orderAddress}
                        onAddressChange={setOrderAddress}
                        showDetail={false}
                        id="order-address"
                        addressPlaceholder="주소 검색 버튼으로 검색하거나 입력하세요"
                      />
                    </div>
                    <div className={styles.fieldRow}>
                      <label className={styles.fieldLabel} htmlFor="order-request">요청사항</label>
                      <input
                        id="order-request"
                        type="text"
                        className={styles.input}
                        value={orderRequest}
                        onChange={(e) => setOrderRequest(e.target.value)}
                        placeholder="배달 시 요청사항 (선택)"
                      />
                    </div>
                  </div>
                ) : (
                  <form id="guest-form" className={styles.guestForm} onSubmit={(e) => e.preventDefault()}>
                    <label className={styles.field}>
                      <span className={styles.label}>이메일</span>
                      <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="order@example.com" required className={styles.input} />
                    </label>
                    <label className={styles.field}>
                      <span className={styles.label}>연락처</span>
                      <input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="010-0000-0000" required className={styles.input} />
                    </label>
                    <label className={styles.field}>
                      <span className={styles.label}>요청사항</span>
                      <input type="text" value={orderRequest} onChange={(e) => setOrderRequest(e.target.value)} placeholder="배달 시 요청사항 (선택)" className={styles.input} />
                    </label>
                  </form>
                )}
              </div>
            </div>

            <div className={styles.cardPayment}>
              <h2 className={styles.cardTitleStatic}>
                <CreditCard size={20} />
                결제방법
              </h2>
              <div className={styles.paymentBody}>
                <div className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>결제 수단</span>
                  <select className={styles.select} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="CARD">카드 (토스페이)</option>
                    <option value="KAKAOPAY">카카오페이</option>
                  </select>
                </div>
                {isAuthenticated && (
                  <div className={styles.couponBlock}>
                    <h3 className={styles.couponTitle}>
                      <Ticket size={18} />
                      쿠폰 선택
                    </h3>
                    <select
                      className={styles.select}
                      value={selectedCouponId ?? ''}
                      onChange={(e) => setSelectedCouponId(e.target.value ? Number(e.target.value) : null)}
                      aria-label="쿠폰 선택"
                    >
                      <option value="">쿠폰 없이 결제</option>
                      {coupons.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.couponName ?? '쿠폰'}
                        </option>
                      ))}
                    </select>
                    {selectedCouponId && (
                      <p className={styles.couponDesc}>
                        선택한 쿠폰에 따라 결제 단계에서 해당 금액만큼 할인됩니다.
                      </p>
                    )}
                    {coupons.length === 0 && <p className={styles.couponNote}>사용 가능한 쿠폰이 없습니다.</p>}
                  </div>
                )}
                <div className={styles.summaryBlock}>
                  <div className={styles.summaryRow}>
                    <span>상품 합계</span>
                    <span>{totalPrice.toLocaleString()}원</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>총 결제 금액</span>
                    <span className={styles.totalAmount}>{totalPrice.toLocaleString()}원</span>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className={styles.submitForm}>
                  {error && <p className={styles.error} role="alert">{error}</p>}
                  <button type="submit" className={styles.submitBtn} disabled={submitting}>
                    <CreditCard size={20} />
                    {submitting ? '처리 중...' : `${totalPrice.toLocaleString()}원 결제하기`}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CartItemOptionModal
        open={!!optionModalItem}
        onClose={() => setOptionModalItem(null)}
        item={optionModalItem}
        onConfirm={async (cartItemId, options) => {
          await updateItemOptions(cartItemId, options);
        }}
      />
    </CheckoutLayout>
  );
}
