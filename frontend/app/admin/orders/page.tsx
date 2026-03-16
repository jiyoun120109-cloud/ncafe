'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useUIStore } from '@/stores/uiStore';
import {
  fetchAdminOrders,
  fetchAdminOrderListSummary,
  deleteAdminOrder,
  getOrderStatusLabel,
  type AdminOrderListResponse,
  type AdminOrderListSummary,
} from '@/services/adminOrderService';
import styles from './page.module.css';

const STATUS_OPTIONS = [
  { value: '', label: '전체' },
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

export default function AdminOrdersPage() {
  const { setTitle } = useUIStore();
  const [data, setData] = useState<AdminOrderListResponse | null>(null);
  const [summary, setSummary] = useState<AdminOrderListSummary | null>(null);
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const size = 10;

  const hasFilter = Boolean(search || status || fromDate || toDate);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    fetchAdminOrders(page, size, {
      search: search || undefined,
      status: status || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, search, status, fromDate, toDate]);

  const loadSummary = useCallback(() => {
    if (!hasFilter) {
      setSummary(null);
      return;
    }
    setSummaryLoading(true);
    fetchAdminOrderListSummary({
      status: status || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    })
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false));
  }, [hasFilter, status, fromDate, toDate]);

  useEffect(() => {
    setTitle('주문 관리');
  }, [setTitle]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(0);
  };

  const handleReset = () => {
    setSearchInput('');
    setSearch('');
    setStatus('');
    setFromDate('');
    setToDate('');
    setPage(0);
    setSummary(null);
    setSelectedIds([]);
  };

  const handleDelete = async (orderId: number, orderNumber: string | null) => {
    if (!confirm(`주문 ${orderNumber || `#${orderId}`}을(를) 삭제하시겠습니까?`)) return;
    setDeletingId(orderId);
    try {
      await deleteAdminOrder(orderId);
      load();
      if (hasFilter) loadSummary();
    } catch (e) {
      alert(e instanceof Error ? e.message : '삭제에 실패했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSelectAll = () => {
    if (!data?.content?.length) return;
    const currentIds = data.content.map((o) => o.id);
    const allSelected = currentIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleBulkDelete = async () => {
    if (!data?.content?.length || selectedIds.length === 0) return;
    if (!confirm(`선택한 ${selectedIds.length}건의 주문을 삭제하시겠습니까?`)) return;
    setBulkDeleting(true);
    try {
      for (const id of selectedIds) {
        try {
          await deleteAdminOrder(id);
        } catch (e) {
          console.error('주문 삭제 실패', id, e);
        }
      }
      setSelectedIds([]);
      load();
      if (hasFilter) loadSummary();
    } finally {
      setBulkDeleting(false);
    }
  };

  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>Orders</p>
        <h2 className={styles.pageTitle}>주문 관리</h2>
      </div>
      <div className={styles.divider} />

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>검색 조건</h3>
        <form onSubmit={handleSearch} className={styles.filterForm}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="order-search">
              검색어
            </label>
            <input
              id="order-search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="주문번호 / 주문 ID / 회원 ID / 이메일 / 연락처 검색"
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="order-status">
              주문 상태
            </label>
            <select
              id="order-status"
              className={styles.filterSelect}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="주문 상태"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>주문 기간</span>
            <div className={styles.dateRow}>
              <input
                type="date"
                className={styles.dateInput}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                aria-label="기간 시작"
              />
              <span className={styles.dateSep}>~</span>
              <input
                type="date"
                className={styles.dateInput}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                aria-label="기간 끝"
              />
            </div>
          </div>
          <div className={styles.filterActions}>
            <button type="submit" className={styles.searchBtn}>
              조회
            </button>
            <button type="button" className={styles.resetBtn} onClick={handleReset}>
              초기화
            </button>
            <button
              type="button"
              className={styles.bulkDeleteBtn}
              onClick={handleBulkDelete}
              disabled={bulkDeleting || selectedIds.length === 0}
            >
              {bulkDeleting ? '삭제 중…' : `선택 삭제 (${selectedIds.length})`}
            </button>
          </div>
        </form>
      </section>

      {hasFilter && (
        <section className={styles.summaryCard}>
          <h3 className={styles.summaryTitle}>필터 조건 집계</h3>
          {summaryLoading ? (
            <p className={styles.summaryLoading}>집계 중…</p>
          ) : summary != null ? (
            <div className={styles.summaryRow}>
              <span className={styles.summaryItem}>
                <strong>총 주문건수</strong> {summary.totalCount.toLocaleString()}건
              </span>
              <span className={styles.summaryItem}>
                <strong>총 매출</strong> {summary.totalRevenue.toLocaleString()}원
              </span>
            </div>
          ) : null}
        </section>
      )}

      <section>
        <h3 className={styles.sectionTitle}>주문 목록</h3>
        {loading ? (
          <div className={styles.loading}>불러오는 중…</div>
        ) : !data || data.content.length === 0 ? (
          <div className={styles.empty}>조건에 맞는 주문이 없습니다.</div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thCheckbox}>
                      <input
                        type="checkbox"
                        checked={
                          !!data.content.length &&
                          data.content.every((o) => selectedIds.includes(o.id))
                        }
                        onChange={toggleSelectAll}
                        aria-label="전체 선택"
                      />
                    </th>
                    <th className={styles.th}>ID</th>
                    <th className={styles.th}>주문번호</th>
                    <th className={styles.th}>주문건수</th>
                    <th className={styles.th}>주문자</th>
                    <th className={styles.th}>상태</th>
                    <th className={styles.th}>금액</th>
                    <th className={styles.th}>주문일시</th>
                    <th className={`${styles.th} ${styles.thActions}`}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((o) => (
                    <tr key={o.id} className={styles.tr}>
                      <td className={styles.tdCheckbox}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(o.id)}
                          onChange={() => toggleSelectOne(o.id)}
                          aria-label={`주문 ${o.orderNumber ?? `#${o.id}`} 선택`}
                        />
                      </td>
                      <td className={`${styles.td} ${styles.idCell}`}>{o.id}</td>
                      <td className={`${styles.td} ${styles.orderNumCell}`}>
                        <Link href={`/admin/orders/${o.id}`} className={styles.orderNumLink}>
                          {o.orderNumber ?? `#${o.id}`}
                        </Link>
                      </td>
                      <td className={styles.td}>{o.itemCount ?? 0}건</td>
                      <td className={styles.td}>
                        {o.userId != null ? `회원 #${o.userId}` : o.guestEmail || o.guestPhone || '—'}
                      </td>
                      <td className={styles.td}>
                        <span className={`${styles.statusBadge} ${statusClass(o.status)}`}>
                          {getOrderStatusLabel(o.status)}
                        </span>
                      </td>
                      <td className={`${styles.td} ${styles.amountCell}`}>
                        {o.totalAmount.toLocaleString()}원
                      </td>
                      <td className={`${styles.td} ${styles.dateCell}`}>
                        {formatDate(o.createdAt)}
                      </td>
                      <td className={`${styles.td} ${styles.tdActions}`}>
                        <div className={styles.actions}>
                          <Link href={`/admin/orders/${o.id}`} className={styles.actionBtn}>
                            상세
                          </Link>
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                            onClick={() => handleDelete(o.id, o.orderNumber ?? null)}
                            disabled={deletingId === o.id}
                            title="삭제"
                          >
                            {deletingId === o.id ? '처리 중…' : '삭제'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <nav className={styles.pagination} aria-label="페이지네이션">
                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={page <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  이전
                </button>
                <span className={styles.pageInfo}>
                  {page + 1} / {totalPages} (총 {totalElements}건)
                </span>
                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  다음
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}
