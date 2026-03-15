'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';
import {
  fetchAdminOrder,
  updateAdminOrderStatus,
  cancelAdminOrder,
  getOrderStatusLabel,
  type AdminOrderDetailDto,
} from '@/services/adminOrderService';
import styles from './page.module.css';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: '결제대기' },
  { value: 'PAID', label: '결제완료' },
  { value: 'PREPARING', label: '준비중' },
  { value: 'COMPLETED', label: '완료' },
  { value: 'CANCELLED', label: '취소' },
];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function statusClass(status: string): string {
  const key = `status${status}` as keyof typeof styles;
  return (styles as Record<string, string>)[key] ?? '';
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const { setTitle } = useUIStore();
  const id = params?.id ? Number(params.id) : null;
  const [order, setOrder] = useState<AdminOrderDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusInput, setStatusInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle('주문 상세');
  }, [setTitle]);

  useEffect(() => {
    if (id == null || isNaN(id)) {
      setLoading(false);
      return;
    }
    fetchAdminOrder(id)
      .then((o) => {
        setOrder(o);
        setStatusInput(o.status);
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id == null || statusInput === order?.status) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateAdminOrderStatus(id, statusInput);
      setOrder(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : '상태 변경에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (id == null || !confirm('이 주문을 취소하시겠습니까?')) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await cancelAdminOrder(id);
      setOrder(updated);
      setStatusInput(updated.status);
    } catch (e) {
      setError(e instanceof Error ? e.message : '취소에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>불러오는 중…</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.page}>
        <p>주문을 찾을 수 없습니다.</p>
        <Link href="/admin/orders" className={styles.backLink}>
          ← 주문 목록
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === 'CANCELLED';
  const hasCoupon = order.appliedUserCouponId != null;
  const totalPrice = order.totalPrice ?? order.totalAmount;
  const discountAmount = totalPrice - order.totalAmount;

  return (
    <div className={styles.page}>
      <Link href="/admin/orders" className={styles.backLink}>
        ← 주문 목록
      </Link>
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>Order</p>
        <h2 className={styles.pageTitle}>
          주문 {order.orderNumber ?? `#${order.id}`}
        </h2>
      </div>
      <div className={styles.divider} />

      <div className={styles.twoCol}>
        {/* 왼쪽 카드: 주문 정보 */}
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>주문 정보</h3>
          <dl className={styles.infoList}>
            <div className={styles.infoRow}>
              <dt>주문번호</dt>
              <dd>{order.orderNumber ?? `#${order.id}`}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>주문 ID</dt>
              <dd>{order.id}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>회원</dt>
              <dd>
                {order.userId != null ? (
                  <Link
                    href={`/admin/members/${order.userId}`}
                    className={styles.memberLink}
                  >
                    {order.userName ?? `회원 #${order.userId}`}
                  </Link>
                ) : (
                  '비회원'
                )}
              </dd>
            </div>
            <div className={styles.infoRow}>
              <dt>이메일</dt>
              <dd>
                {order.userId != null
                  ? (order.userEmail ?? order.guestEmail ?? '—')
                  : (order.guestEmail ?? '—')}
              </dd>
            </div>
            <div className={styles.infoRow}>
              <dt>연락처</dt>
              <dd>
                {order.userId != null
                  ? (order.userPhone ?? order.guestPhone ?? '—')
                  : (order.guestPhone ?? '—')}
              </dd>
            </div>
            <div className={styles.infoRow}>
              <dt>주문일시</dt>
              <dd>{formatDate(order.createdAt)}</dd>
            </div>
            {order.updatedAt && (
              <div className={styles.infoRow}>
                <dt>수정일시</dt>
                <dd>{formatDate(order.updatedAt)}</dd>
              </div>
            )}
            <div className={styles.infoRow}>
              <dt>상태</dt>
              <dd>
                <span className={`${styles.statusBadge} ${statusClass(order.status)}`}>
                  {getOrderStatusLabel(order.status)}
                </span>
              </dd>
            </div>
            <div className={styles.infoRow}>
              <dt>총 금액</dt>
              <dd>{order.totalAmount.toLocaleString()}원</dd>
            </div>
          </dl>
        </section>

        {/* 오른쪽 카드: 주문 메뉴, 결제/쿠폰/할인, 상태 변경 */}
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>주문 메뉴</h3>
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th>메뉴명</th>
                <th>옵션</th>
                <th>수량</th>
                <th>단가</th>
                <th>금액</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => {
                const lineTotal =
                  (item.unitPrice + (item.optionExtraPrice || 0)) * item.quantity;
                return (
                  <tr key={item.id}>
                    <td>{item.menuName}</td>
                    <td>{item.optionsDisplay || '—'}</td>
                    <td>{item.quantity}</td>
                    <td>
                      {(item.unitPrice + (item.optionExtraPrice || 0)).toLocaleString()}원
                    </td>
                    <td>{lineTotal.toLocaleString()}원</td>
                  </tr>
                );
              })}
              <tr className={styles.totalRow}>
                <td colSpan={4}>합계</td>
                <td>{order.totalAmount.toLocaleString()}원</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.rightMeta}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>결제방법</span>
              <span className={styles.metaValue}>
                {order.status === 'PAID' || order.status === 'PREPARING' || order.status === 'COMPLETED'
                  ? '결제완료'
                  : order.status === 'CANCELLED'
                    ? '—'
                    : '결제대기'}
              </span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>쿠폰 사용</span>
              <span className={styles.metaValue}>
                {hasCoupon ? '사용함' : '미사용'}
              </span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>할인가격</span>
              <span className={styles.metaValue}>
                {discountAmount > 0 ? `-${discountAmount.toLocaleString()}원` : '0원'}
              </span>
            </div>
          </div>

          {!isCancelled && (
            <>
              <h4 className={styles.editSubTitle}>상태 변경</h4>
              <form onSubmit={handleStatusSubmit}>
                <div className={styles.formRow}>
                  <label className={styles.label}>상태</label>
                  <select
                    className={styles.select}
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    disabled={saving}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                {error && <p className={styles.error}>{error}</p>}
                <div className={`${styles.actions} ${styles.actionsRight}`}>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={saving || statusInput === order.status}
                  >
                    {saving ? '저장 중…' : '상태 저장'}
                  </button>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    주문 취소
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
