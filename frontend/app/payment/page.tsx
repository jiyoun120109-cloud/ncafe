'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useSearchParams } from 'next/navigation';
import { CreditCard, CheckCircle, Receipt, AlertCircle, Ticket } from 'lucide-react';
import { getOrder, paymentReady, paymentComplete, applyCouponToOrder, type OrderDto } from '@/services/orderService';
import { useCart } from '@/contexts/CartContext';
import { useAuthStore } from '@/stores/authStore';
import { getUserCoupons, type UserCouponDto } from '@/services/userService';
import CheckoutLayout from '@/components/CheckoutLayout/CheckoutLayout';
import styles from './page.module.css';

const TOSS_SCRIPT = 'https://js.tosspayments.com/v1/payment';
const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || '';

/** 토스 orderId 형식: 6~64자 (백엔드와 동일) */
function toTossOrderId(orderId: number): string {
  return `ncafe-${orderId}`;
}

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      requestPayment: (
        method: string,
        params: {
          amount: number;
          orderId: string;
          orderName: string;
          successUrl: string;
          failUrl: string;
        }
      ) => Promise<void>;
    };
  }
}

function PaymentContent({ tossLoaded }: { tossLoaded: boolean }) {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const complete = searchParams.get('complete') === '1';
  const fail = searchParams.get('fail') === '1';
  const paymentKeyParam = searchParams.get('paymentKey');
  const failMessage = searchParams.get('message') || searchParams.get('code') || null;
  const orderId = orderIdParam ? parseInt(orderIdParam, 10) : null;

  const { clearAll } = useCart();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [coupons, setCoupons] = useState<UserCouponDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [completed, setCompleted] = useState(complete);
  const [error, setError] = useState<string | null>(null);
  const completeRequestSent = useRef(false);

  useEffect(() => {
    if (!orderId || isNaN(orderId)) {
      setLoading(false);
      setError('주문 정보가 없습니다.');
      return;
    }
    if (fail && failMessage) {
      setError(decodeURIComponent(failMessage));
      setLoading(false);
      return;
    }
    if (complete) {
      if (completeRequestSent.current) {
        setLoading(false);
        return;
      }
      completeRequestSent.current = true;
      const pgTid = paymentKeyParam || undefined;
      paymentComplete(orderId, pgTid)
        .then(() => {
          setCompleted(true);
          clearAll();
        })
        .catch((e) => setError(e instanceof Error ? e.message : '결제 완료 처리에 실패했습니다.'))
        .finally(() => setLoading(false));
      return;
    }
    getOrder(orderId)
      .then(setOrder)
      .catch((e) => setError(e instanceof Error ? e.message : '주문을 불러올 수 없습니다.'))
      .finally(() => setLoading(false));
  }, [orderId, complete, fail, failMessage, paymentKeyParam, clearAll]);

  useEffect(() => {
    if (isAuthenticated && orderId && !complete) {
      getUserCoupons()
        .then((list) => setCoupons(list.filter((c) => !c.usedAt)))
        .catch(() => setCoupons([]));
    } else {
      setCoupons([]);
    }
  }, [isAuthenticated, orderId, complete]);

  const handleApplyCoupon = async (userCouponId: number) => {
    if (!orderId || isNaN(orderId)) return;
    setApplyingCoupon(true);
    setError(null);
    try {
      const updated = await applyCouponToOrder(orderId, userCouponId);
      setOrder(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : '쿠폰 적용에 실패했습니다.');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleTossPay = async () => {
    if (!orderId || isNaN(orderId) || !order) return;
    if (!tossLoaded || !TOSS_CLIENT_KEY || !window.TossPayments) {
      setError('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }
    setPaying(true);
    setError(null);
    try {
      await paymentReady(orderId, 'TOSS');
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const successUrl = `${origin}/payment?orderId=${orderId}&complete=1`;
      const failUrl = `${origin}/payment?orderId=${orderId}&fail=1`;
      const orderName =
        order.items.length > 0
          ? `${order.items[0].menuName} 외 ${order.items.length - 1}건`
          : `주문 #${orderId}`;

      const tossPayments = window.TossPayments(TOSS_CLIENT_KEY);
      await tossPayments.requestPayment('CARD', {
        amount: order.totalAmount,
        orderId: toTossOrderId(orderId),
        orderName,
        successUrl,
        failUrl,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : '결제 준비에 실패했습니다.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <CheckoutLayout currentStep="payment">
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>주문 정보를 불러오는 중...</p>
        </div>
      </CheckoutLayout>
    );
  }

  if (error && !order) {
    return (
      <CheckoutLayout currentStep="payment">
        <div className={styles.errorCard}>
          <AlertCircle className={styles.errorIcon} />
          <h2 className={styles.errorTitle}>오류가 발생했어요</h2>
          <p className={styles.errorMessage}>{error}</p>
          <Link href="/order" className={styles.primaryBtn}>주문 페이지로</Link>
        </div>
      </CheckoutLayout>
    );
  }

  if (completed) {
    return (
      <CheckoutLayout currentStep="payment">
        <div className={styles.completeCard}>
          <div className={styles.completeIconWrap}>
            <CheckCircle size={56} className={styles.completeIcon} />
          </div>
          <h1 className={styles.completeTitle}>결제가 완료되었어요</h1>
          <p className={styles.completeDesc}>주문이 정상적으로 접수되었습니다.</p>
          {orderId && (
            <p className={styles.orderNumber}>주문 번호 <strong>{orderId}</strong></p>
          )}
          <div className={styles.completeActions}>
            <Link href="/user?tab=orders" className={styles.primaryBtn}>
              주문 내역 보기
            </Link>
            <Link href="/menus" className={styles.secondaryBtn}>
              메뉴 더 보기
            </Link>
          </div>
        </div>
      </CheckoutLayout>
    );
  }

  return (
    <CheckoutLayout currentStep="payment">
      {order && (
          <>
            <section className={styles.section} aria-labelledby="payment-order-heading">
              <h2 id="payment-order-heading" className={styles.sectionTitle}>
                <Receipt size={20} />
                주문 내용
              </h2>
              <p className={styles.orderId}>주문 번호 <strong>#{order.id}</strong></p>
              <ul className={styles.itemList}>
                {order.items.map((item) => {
                  const unitPrice = item.unitPrice + (item.optionExtraPrice ?? 0);
                  const lineTotal = unitPrice * item.quantity;
                  return (
                    <li key={item.id} className={styles.itemRow}>
                      <div className={styles.itemInfo}>
                        <span className={styles.itemName}>{item.menuName}</span>
                        {item.optionsDisplay && (
                          <span className={styles.itemOptions}>{item.optionsDisplay}</span>
                        )}
                        <span className={styles.itemQty}>수량 {item.quantity}</span>
                      </div>
                      <span className={styles.itemTotal}>{lineTotal.toLocaleString()}원</span>
                    </li>
                  );
                })}
              </ul>
              <div className={styles.totalRow}>
                <span>총 결제 금액</span>
                <span className={styles.totalAmount}>{order.totalAmount.toLocaleString()}원</span>
              </div>
            </section>

            {isAuthenticated && (coupons.length > 0 || order.appliedUserCouponId) && (
              <section className={styles.couponSection} aria-labelledby="payment-coupon-heading">
                <h2 id="payment-coupon-heading" className={styles.sectionTitle}>
                  <Ticket size={20} />
                  보유 쿠폰
                </h2>
                {order.appliedUserCouponId ? (
                  <p className={styles.appliedCoupon}>
                    쿠폰이 적용되었습니다. 할인된 금액으로 결제됩니다.
                  </p>
                ) : (
                  <div className={styles.couponSelectWrap}>
                    <select
                      className={styles.couponSelect}
                      disabled={applyingCoupon}
                      value=""
                      onChange={(e) => {
                        const id = e.target.value ? Number(e.target.value) : 0;
                        if (id) handleApplyCoupon(id);
                        e.target.value = '';
                      }}
                      aria-label="쿠폰 선택"
                    >
                      <option value="">쿠폰 선택</option>
                      {coupons.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.couponName ?? '쿠폰'} (사용 가능)
                        </option>
                      ))}
                    </select>
                    {applyingCoupon && <span className={styles.couponApplying}>적용 중...</span>}
                  </div>
                )}
              </section>
            )}

            <section className={styles.paymentSection}>
              <p className={styles.paymentHint}>
                토스페이먼츠 결제창으로 안전하게 결제합니다. (테스트 환경)
              </p>
              {error && <p className={styles.error} role="alert">{error}</p>}
              <button
                type="button"
                className={styles.kakaoBtn}
                onClick={handleTossPay}
                disabled={paying || !tossLoaded || !TOSS_CLIENT_KEY}
              >
                <CreditCard size={20} />
                {paying ? '결제창을 여는 중...' : '결제하기'}
              </button>
            </section>
          </>
        )}
    </CheckoutLayout>
  );
}

export default function PaymentPage() {
  return (
    <>
      <Script src={TOSS_SCRIPT} strategy="afterInteractive" />
      <PaymentContentWrapper />
    </>
  );
}

function PaymentContentWrapper() {
  const [tossLoaded, setTossLoaded] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.TossPayments) {
      setTossLoaded(true);
    }
    const t = setInterval(() => {
      if (typeof window !== 'undefined' && window.TossPayments) {
        setTossLoaded(true);
        clearInterval(t);
      }
    }, 300);
    return () => clearInterval(t);
  }, []);
  return (
    <Suspense fallback={
      <CheckoutLayout currentStep="payment">
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>불러오는 중...</p>
        </div>
      </CheckoutLayout>
    }>
      <PaymentContent tossLoaded={tossLoaded} />
    </Suspense>
  );
}
