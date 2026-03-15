'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getApiBase } from '@/services/api';
import styles from './page.module.css';

/** 문의 작성 시 선택하는 유형과 동일한 라벨 */
const INQUIRY_TYPE_LABELS: Record<string, string> = {
  GENERAL: '일반 문의',
  MENU: '메뉴/제품',
  ORDER: '주문/결제',
  STORE: '매장 이용',
  ETC: '기타',
};

const INQUIRY_TYPE_OPTIONS = [
  { value: '', label: '전체 항목' },
  ...Object.entries(INQUIRY_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

const HAS_REPLY_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'true', label: '답변완료' },
  { value: 'false', label: '미답변' },
];

function getInquiryTypeLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return INQUIRY_TYPE_LABELS[value] ?? value;
}

interface Inquiry {
  id: number;
  userId: number;
  inquiryType?: string | null;
  title: string;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  hasReply?: boolean;
  replies?: { id: number; content: string; createdAt: string }[];
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ko-KR', {
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

export default function AdminInquiriesPage() {
  const [list, setList] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [inquiryType, setInquiryType] = useState('');
  const [hasReply, setHasReply] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const currentIds = list.map((i) => i.id);
  const allSelected = list.length > 0 && currentIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0;

  const loadList = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (inquiryType) params.set('inquiryType', inquiryType);
    if (hasReply === 'true' || hasReply === 'false') params.set('hasReply', hasReply);
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);
    const q = params.toString();
    fetch(`${getApiBase()}/admin/inquiries${q ? `?${q}` : ''}`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [search, inquiryType, hasReply, fromDate, toDate]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.forEach((id) => {
        if (!currentIds.includes(id)) next.delete(id);
      });
      return next;
    });
  }, [list]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        currentIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        currentIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`선택한 ${selectedIds.size}건의 문의를 삭제하시겠습니까?`)) return;
    setBulkDeleting(true);
    try {
      const res = await fetch(`${getApiBase()}/admin/inquiries/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (!res.ok) throw new Error('일괄 삭제에 실패했습니다.');
      setSelectedIds(new Set());
      loadList();
    } catch (e) {
      alert(e instanceof Error ? e.message : '일괄 삭제에 실패했습니다.');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`문의 "${title}"(ID: ${id})을(를) 삭제하시겠습니까?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${getApiBase()}/admin/inquiries/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.status === 404) throw new Error('문의를 찾을 수 없습니다.');
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      loadList();
    } catch (e) {
      alert(e instanceof Error ? e.message : '삭제에 실패했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  const hasFilter = Boolean(search || inquiryType || hasReply || fromDate || toDate);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>Inquiries</p>
        <h2 className={styles.pageTitle}>1:1 문의 관리</h2>
      </div>
      <div className={styles.divider} />

      <section>
        <div className={styles.listHeader}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="제목·내용 검색"
              className={styles.searchInput}
              aria-label="제목·내용 검색"
            />
          </form>
          <div className={styles.listToolbar}>
            <select
              value={inquiryType}
              onChange={(e) => setInquiryType(e.target.value)}
              className={styles.filterSelect}
              aria-label="문의 항목"
            >
              {INQUIRY_TYPE_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={hasReply}
              onChange={(e) => setHasReply(e.target.value)}
              className={styles.filterSelect}
              aria-label="답변 유무"
            >
              {HAS_REPLY_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <div className={styles.dateRow}>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className={styles.dateInput}
                aria-label="기간 시작"
              />
              <span className={styles.dateSep}>~</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className={styles.dateInput}
                aria-label="기간 끝"
              />
            </div>
            {someSelected && (
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className={styles.deleteSelectedBtn}
              >
                {bulkDeleting ? '삭제 중…' : `선택 삭제 (${selectedIds.size}건)`}
              </button>
            )}
          </div>
        </div>

        <h3 className={styles.sectionTitle}>문의 목록</h3>
        {loading ? (
          <div className={styles.loading}>불러오는 중…</div>
        ) : list.length === 0 ? (
          <div className={styles.empty}>
            {hasFilter ? '검색/필터 결과가 없습니다.' : '등록된 문의가 없습니다.'}
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={`${styles.th} ${styles.thCheckbox}`}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      aria-label="전체 선택"
                      className={styles.checkbox}
                    />
                  </th>
                  <th className={styles.th}>ID</th>
                  <th className={styles.th}>문의항목속성</th>
                  <th className={`${styles.th} ${styles.thLeft}`}>제목</th>
                  <th className={styles.th}>답변</th>
                  <th className={`${styles.th} ${styles.thLeft}`}>내용 미리보기</th>
                  <th className={styles.th}>작성일시</th>
                  <th className={`${styles.th} ${styles.thActions}`}>관리</th>
                </tr>
              </thead>
              <tbody>
                {list.map((i) => (
                  <tr key={i.id} className={styles.tr}>
                    <td className={`${styles.td} ${styles.tdCheckbox}`}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(i.id)}
                        onChange={() => toggleSelect(i.id)}
                        aria-label={`문의 ${i.title} 선택`}
                        className={styles.checkbox}
                      />
                    </td>
                    <td className={`${styles.td} ${styles.idCell}`}>{i.id}</td>
                    <td className={styles.td}>{getInquiryTypeLabel(i.inquiryType)}</td>
                    <td className={`${styles.td} ${styles.tdLeft}`}>
                      {i.isPrivate ? '[비밀] ' : ''}{i.title}
                    </td>
                    <td className={styles.td}>
                      {i.hasReply ? (
                        <span className={styles.replyDone}>답변완료</span>
                      ) : (
                        <span className={styles.replyPending}>—</span>
                      )}
                    </td>
                    <td className={`${styles.td} ${styles.tdLeft}`}>
                      <span className={styles.contentPreview}>
                        {i.content || '—'}
                      </span>
                    </td>
                    <td className={`${styles.td} ${styles.dateCell}`}>
                      {formatDate(i.createdAt)}
                    </td>
                    <td className={`${styles.td} ${styles.tdActions}`}>
                      <div className={styles.actions}>
                        <Link href={`/admin/inquiries/${i.id}`} className={styles.actionBtn}>
                          상세
                        </Link>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                          onClick={() => handleDelete(i.id, i.title)}
                          disabled={deletingId === i.id}
                          title="삭제"
                        >
                          {deletingId === i.id ? '처리 중…' : '삭제'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
