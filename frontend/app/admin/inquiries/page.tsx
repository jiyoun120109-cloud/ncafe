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

  const loadList = useCallback(() => {
    setLoading(true);
    fetch(`${getApiBase()}/admin/inquiries`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

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

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>Inquiries</p>
        <h2 className={styles.pageTitle}>1:1 문의 관리</h2>
      </div>
      <div className={styles.divider} />

      <section>
        <h3 className={styles.sectionTitle}>문의 목록</h3>
        {loading ? (
          <div className={styles.loading}>불러오는 중…</div>
        ) : list.length === 0 ? (
          <div className={styles.empty}>등록된 문의가 없습니다.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
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
