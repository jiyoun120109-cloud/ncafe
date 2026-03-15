'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getOrder, type OrderDto } from '@/services/orderService';
import { getUserProfile, type UserProfileDto } from '@/services/userService';
import { getApiBase } from '@/services/api';
import { menuImageUrl } from '@/utils/menuImageUrl';
import PageWithHero from '@/components/PageWithHero/PageWithHero';
import styles from './page.module.css';

function getStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING': return '대기 중';
    case 'PAID': return '결제완료';
    case 'CANCELLED': return '취소됨';
    default: return status;
  }
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'PENDING': return styles.statusPending;
    case 'PAID': return styles.statusPaid;
    case 'CANCELLED': return styles.statusCancelled;
    default: return styles.statusDefault;
  }
}

function formatDate(createdAt: string): string {
  try {
    return new Date(createdAt).toISOString().slice(0, 10);
  } catch {
    return createdAt?.slice(0, 10) ?? '-';
  }
}

interface MenuImageMap {
  [menuId: number]: string;
}

export default function UserOrderDetailPage() {
  const params = useParams();
  const id = params?.id ? Number(params.id) : null;
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [menuImageMap, setMenuImageMap] = useState<MenuImageMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id == null || isNaN(id)) {
      setLoading(false);
      return;
    }
    getOrder(id)
      .then((o) => {
        setOrder(o);
        setError(null);
        if (o.userId) {
          getUserProfile().then(setProfile).catch(() => setProfile(null));
        }
        fetch(`${getApiBase()}/menus`, { credentials: 'include' })
          .then((r) => r.json())
          .then((data: { menus?: { id: number; imageSrc?: string | null }[] }) => {
            const map: MenuImageMap = {};
            (data.menus ?? []).forEach((m: { id: number; imageSrc?: string | null }) => {
              if (m.id != null) map[m.id] = m.imageSrc ?? '';
            });
            setMenuImageMap(map);
          })
          .catch(() => { /* 메뉴 이미지 실패 시 무시, 상품명만 표시 */ });
      })
      .catch((e) => setError(e instanceof Error ? e.message : '불러오기 실패'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PageWithHero title="주문 상세" backHref="/user?tab=orders" backLabel="주문 내역" mainClassName={styles.main}>
        <p className={styles.loading}>불러오는 중...</p>
      </PageWithHero>
    );
  }

  if (error || !order) {
    return (
      <PageWithHero title="주문 상세" backHref="/user?tab=orders" backLabel="주문 내역" mainClassName={styles.main}>
        <p className={styles.error}>{error ?? '주문을 찾을 수 없습니다.'}</p>
        <Link href="/user?tab=orders" className={styles.link}>주문 내역으로</Link>
      </PageWithHero>
    );
  }

  const deliveryFee = 0;
  const finalAmount = order.totalPrice ?? order.totalAmount ?? 0;
  const productSubtotal = useMemo(
    () => order.items.reduce((sum, it) => sum + (it.unitPrice + (it.optionExtraPrice ?? 0)) * it.quantity, 0),
    [order.items]
  );
  const couponDiscount = order.appliedUserCouponId != null ? Math.max(0, productSubtotal - finalAmount) : 0;
  const recipientName = profile?.name ?? (order.guestEmail ? '비회원' : '-');
  const recipientPhone = profile?.phone ?? order.guestPhone ?? '-';
  const recipientAddress = profile?.address ?? '-';

  return (
    <PageWithHero
      title="주문 상세"
      backHref="/user?tab=orders"
      backLabel="주문 내역"
      mainClassName={styles.main}
    >
      <div className={styles.orderInfo}>
        <p><span className={styles.label}>주문번호:</span> {order.orderNumber ?? `ORD-${order.id}`}</p>
        <p><span className={styles.label}>주문일자:</span> {formatDate(order.createdAt)}</p>
        <p>
          <span className={styles.label}>상태:</span>{' '}
          <span className={`${styles.statusTag} ${getStatusClass(order.status)}`}>{getStatusLabel(order.status)}</span>
        </p>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>주문 상품</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>상품 정보</th>
                <th>옵션</th>
                <th>수량</th>
                <th>가격</th>
                <th>소계</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => {
                const unitPrice = it.unitPrice + (it.optionExtraPrice ?? 0);
                const subtotal = unitPrice * it.quantity;
                const imageSrc = menuImageMap[it.menuId];
                return (
                  <tr key={it.id}>
                    <td>
                      <div className={styles.productCell}>
                        <Link href={`/menus/${it.menuId}`} className={styles.productThumbLink} aria-hidden>
                          <img src={menuImageUrl(imageSrc)} alt="" className={styles.thumbImg} />
                        </Link>
                        <div className={styles.productInfo}>
                          <Link href={`/menus/${it.menuId}`} className={styles.productName}>{it.menuName}</Link>
                          <span className={styles.productQty}>수량: {it.quantity}개</span>
                        </div>
                      </div>
                    </td>
                    <td className={styles.optionCell}>{it.optionsDisplay ?? '-'}</td>
                    <td>{it.quantity}</td>
                    <td>₩{unitPrice.toLocaleString()}</td>
                    <td className={styles.subtotalCell}>₩{subtotal.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className={styles.totals}>
          <p><span className={styles.totalsLabel}>상품 총계:</span> ₩{productSubtotal.toLocaleString()}</p>
          {deliveryFee > 0 && (
            <p><span className={styles.totalsLabel}>배송비:</span> ₩{deliveryFee.toLocaleString()}</p>
          )}
          <p className={styles.totalFinal}>
            <span className={styles.totalsLabel}>총 결제 금액:</span> ₩{(finalAmount + deliveryFee).toLocaleString()}
          </p>
        </div>
      </section>

      <div className={styles.infoGrid}>
        <div className={styles.infoBox}>
          <h3 className={styles.infoTitle}>배송 정보</h3>
          <p><span className={styles.label}>받는 사람:</span> {recipientName}</p>
          <p><span className={styles.label}>주소:</span> {recipientAddress}</p>
          <p><span className={styles.label}>연락처:</span> {recipientPhone}</p>
        </div>
        <div className={styles.infoBox}>
          <h3 className={styles.infoTitle}>결제 정보</h3>
          <p><span className={styles.label}>결제 방법:</span> {order.status === 'PAID' ? '신용카드' : '-'}</p>
          <p><span className={styles.label}>상품 총계:</span> ₩{productSubtotal.toLocaleString()}</p>
          {deliveryFee > 0 && <p><span className={styles.label}>배송비:</span> ₩{deliveryFee.toLocaleString()}</p>}
          {couponDiscount > 0 && (
            <p><span className={styles.label}>쿠폰 할인:</span> <span className={styles.couponDiscount}>-₩{couponDiscount.toLocaleString()}</span></p>
          )}
          <p><span className={styles.label}>최종 결제 금액:</span> ₩{(finalAmount + deliveryFee).toLocaleString()}</p>
        </div>
      </div>

      <div className={styles.actions}>
        <Link href="/inquiries/new" className={styles.inquiryBtn}>
          고객센터 문의하기
        </Link>
      </div>
    </PageWithHero>
  );
}
