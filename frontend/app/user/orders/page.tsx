'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getMyOrders, type OrderDto } from '@/services/orderService';
import PageWithHero from '@/components/PageWithHero/PageWithHero';
import styles from './page.module.css';

const ITEMS_PER_PAGE = 5;

type StatusFilter = 'all' | 'PAID' | 'CANCELLED';

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

function formatOrderDate(createdAt: string): string {
  try {
    const d = new Date(createdAt);
    return d.toISOString().slice(0, 10);
  } catch {
    return createdAt?.slice(0, 10) ?? '-';
  }
}

function getMonthRange(monthsBack: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to.getFullYear(), to.getMonth() - monthsBack, 1);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export default function UserOrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [dateRange, setDateRange] = useState(() => getMonthRange(1));
  const [sortRecent, setSortRecent] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?returnUrl=${encodeURIComponent('/user/orders')}`);
      return;
    }
    getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (filter === 'PAID') list = list.filter((o) => o.status === 'PAID');
    else if (filter === 'CANCELLED') list = list.filter((o) => o.status === 'CANCELLED');
    try {
      const from = new Date(dateRange.from).getTime();
      const to = new Date(dateRange.to).getTime() + 86400000;
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
      return sortRecent ? tb - ta : ta - tb;
    });
    return list;
  }, [orders, filter, dateRange, sortRecent]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const slice = useMemo(
    () => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filtered, currentPage]
  );

  const countAll = orders.length;
  const countPaid = orders.filter((o) => o.status === 'PAID').length;
  const countCancelled = orders.filter((o) => o.status === 'CANCELLED').length;

  return (
    <PageWithHero
      title="주문 내역"
      backHref="/user"
      backLabel="마이페이지"
      mainClassName={styles.main}
    >
      {loading ? (
        <p className={styles.loading}>불러오는 중...</p>
      ) : (
        <>
          <div className={styles.toolbar}>
            <div className={styles.filters}>
              <button
                type="button"
                className={filter === 'all' ? styles.filterActive : styles.filterBtn}
                onClick={() => { setFilter('all'); setPage(1); }}
              >
                전체 ({countAll})
              </button>
              <button
                type="button"
                className={filter === 'PAID' ? styles.filterActive : styles.filterBtn}
                onClick={() => { setFilter('PAID'); setPage(1); }}
              >
                결제완료 ({countPaid})
              </button>
              <button
                type="button"
                className={filter === 'CANCELLED' ? styles.filterActive : styles.filterBtn}
                onClick={() => { setFilter('CANCELLED'); setPage(1); }}
              >
                취소된 주문 ({countCancelled})
              </button>
            </div>
            <div className={styles.controls}>
              <span className={styles.dateLabel}>
                {dateRange.from.slice(0, 7).replace('-', '.')} - {dateRange.to.slice(0, 7).replace('-', '.')}
              </span>
              <select
                className={styles.sortSelect}
                value={sortRecent ? 'recent' : 'old'}
                onChange={(e) => { setSortRecent(e.target.value === 'recent'); setPage(1); }}
              >
                <option value="recent">최근 주문 순</option>
                <option value="old">과거 주문 순</option>
              </select>
            </div>
          </div>

          {slice.length === 0 ? (
            <p className={styles.empty}>주문 내역이 없습니다.</p>
          ) : (
            <ul className={styles.cardList}>
              {slice.map((o) => (
                <li key={o.id} className={styles.card}>
                  <div className={styles.cardRow}>
                    <span className={styles.orderNumber}>
                      주문번호: {o.orderNumber ?? `ORD-${o.id}`}
                    </span>
                    <span className={`${styles.statusTag} ${getStatusClass(o.status)}`}>
                      {getStatusLabel(o.status)}
                    </span>
                  </div>
                  <p className={styles.orderDate}>주문일자: {formatOrderDate(o.createdAt)}</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.totalAmount}>
                      총 금액: ₩{(o.totalPrice ?? o.totalAmount)?.toLocaleString() ?? '0'}
                    </span>
                    <Link href={`/user/orders/${o.id}`} className={styles.detailBtn}>
                      주문 상세보기
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <nav className={styles.pagination} aria-label="주문 목록 페이지">
              <button
                type="button"
                className={styles.pageBtn}
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={n === currentPage ? styles.pageBtnActive : styles.pageBtn}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className={styles.pageBtn}
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={18} />
              </button>
            </nav>
          )}
        </>
      )}
    </PageWithHero>
  );
}
