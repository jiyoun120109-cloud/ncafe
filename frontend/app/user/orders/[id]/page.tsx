'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getOrder, type OrderDto } from '@/services/orderService';
import styles from './page.module.css';

export default function UserOrderDetailPage() {
  const params = useParams();
  const id = params?.id ? Number(params.id) : null;
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id == null || isNaN(id)) {
      setLoading(false);
      return;
    }
    getOrder(id)
      .then(setOrder)
      .catch((e) => setError(e instanceof Error ? e.message : '불러오기 실패'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={styles.loading}>불러오는 중...</div>;
  if (error || !order) return <main className={styles.main}><p>{error || '주문을 찾을 수 없습니다.'}</p><Link href="/user">마이페이지</Link></main>;

  return (
    <main className={styles.main}>
      <Link href="/user" className={styles.backLink}><ChevronLeft size={18} /> 마이페이지</Link>
      <h1 className={styles.title}>주문 #{order.id}</h1>
      <p className={styles.status}>상태: {order.status}</p>
      <p className={styles.amount}>총 결제 금액: {order.totalAmount.toLocaleString()}원</p>
      <ul className={styles.items}>
        {order.items.map((it) => (
          <li key={it.id}>
            {it.menuName} x {it.quantity} · {(it.unitPrice + (it.optionExtraPrice ?? 0)) * it.quantity}원
          </li>
        ))}
      </ul>
    </main>
  );
}
