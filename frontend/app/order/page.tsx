'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CreditCard, Minus, Plus, Trash2, LogIn, User, Receipt } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuthStore } from '@/stores/authStore';
import { createOrder, type OrderItemInput } from '@/services/orderService';
import type { CartItemDto } from '@/services/cartService';
import CheckoutLayout from '@/components/CheckoutLayout/CheckoutLayout';
import CartItemOptionModal from '@/app/cart/_components/CartItemOptionModal';
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
  const { user, isAuthenticated } = useAuthStore();
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optionModalItem, setOptionModalItem] = useState<CartItemDto | null>(null);

  const totalPrice = items.reduce(
    (sum, it) => sum + (it.menuPrice + (it.optionExtraPrice ?? 0)) * it.quantity,
    0
  );
  const totalQuantity = items.reduce((sum, it) => sum + it.quantity, 0);

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
        guestPhone: isAuthenticated ? null : guestPhone.trim(),
        items: toOrderItems(items),
      };
      const result = await createOrder(payload);
      router.push(`/payment?orderId=${result.orderId}`);
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
    <CheckoutLayout currentStep="order">
      {!isAuthenticated && (
        <div className={styles.loginBanner}>
          <LogIn size={18} />
          <span>
            회원이시면 <Link href={`/login?returnUrl=${encodeURIComponent('/order')}`} className={styles.loginLink}>로그인</Link> 후 주문하시면 주문 내역을 확인할 수 있어요.
          </span>
        </div>
      )}

      {/* 주문 상품 — 장바구니처럼 이미지·옵션·수량·삭제·옵션변경 */}
      <section className={styles.section} aria-labelledby="order-items-heading">
        <h2 id="order-items-heading" className={styles.sectionTitle}>
          <Receipt size={20} />
          주문 상품
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
                  {/* 이미지 URL: CartItemDto.menuImageUrl (cartService.ts) */}
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
                      <button
                        type="button"
                        className={styles.removeBtn}
                        aria-label="삭제"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  {item.optionsDisplay && <p className={styles.itemOptions}>{item.optionsDisplay}</p>}
                  {!soldOut && (
                    <button
                      type="button"
                      className={styles.optionChangeBtn}
                      onClick={() => setOptionModalItem(item)}
                    >
                      옵션변경
                    </button>
                  )}
                  <div className={styles.itemPriceRow}>
                    <span className={styles.unitPrice}>{unitPrice.toLocaleString()}원</span>
                    <div className={styles.quantity}>
                      <button
                        type="button"
                        aria-label="수량 줄이기"
                        disabled={soldOut}
                        onClick={() => !soldOut && updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      >
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="수량 늘리기"
                        disabled={soldOut}
                        onClick={() => !soldOut && updateQuantity(item.id, item.quantity + 1)}
                      >
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
      </section>

      <CartItemOptionModal
        open={!!optionModalItem}
        onClose={() => setOptionModalItem(null)}
        item={optionModalItem}
        onConfirm={async (cartItemId, options) => {
          await updateItemOptions(cartItemId, options);
        }}
      />

      {/* 주문자 정보 */}
      <section className={styles.section} aria-labelledby="orderer-heading">
        <h2 id="orderer-heading" className={styles.sectionTitle}>
          <User size={20} />
          주문자 정보
        </h2>
        {isAuthenticated && user ? (
          <div className={styles.memberInfo}>
            <p><strong>{user.name || user.username}</strong>님으로 주문됩니다.</p>
          </div>
        ) : (
          <form id="guest-form" className={styles.guestForm} onSubmit={(e) => e.preventDefault()}>
            <label className={styles.field}>
              <span className={styles.label}>이메일</span>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="order@example.com"
                required
                className={styles.input}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>연락처</span>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="010-0000-0000"
                required
                className={styles.input}
              />
            </label>
          </form>
        )}
      </section>

      {/* 결제 금액 */}
      <section className={styles.section} aria-labelledby="payment-summary-heading">
        <h2 id="payment-summary-heading" className={styles.sectionTitle}>결제 금액</h2>
        <div className={styles.summaryRows}>
          <div className={styles.summaryRow}>
            <span>총 수량</span>
            <span>{totalQuantity}개</span>
          </div>
          <div className={styles.summaryRow}>
            <span>총 결제 금액</span>
            <span className={styles.totalAmount}>{totalPrice.toLocaleString()}원</span>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className={styles.submitForm}>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <button type="submit" className={styles.submitBtn} disabled={submitting}>
          <CreditCard size={20} />
          {submitting ? '처리 중...' : `${totalPrice.toLocaleString()}원 결제하기`}
        </button>
      </form>
    </CheckoutLayout>
  );
}
