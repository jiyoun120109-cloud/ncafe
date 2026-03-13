'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getApiBase } from '@/services/api';
import styles from './page.module.css';

interface Inquiry {
  id: number;
  userId: number;
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

  useEffect(() => {
    fetch(`${getApiBase()}/admin/inquiries`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

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
                  <th className={styles.th}>제목</th>
                  <th className={styles.th}>답변</th>
                  <th className={styles.th}>내용 미리보기</th>
                  <th className={styles.th}>작성일시</th>
                  <th className={styles.th}>관리</th>
                </tr>
              </thead>
              <tbody>
                {list.map((i) => (
                  <tr key={i.id} className={styles.tr}>
                    <td className={`${styles.td} ${styles.idCell}`}>{i.id}</td>
                    <td className={styles.td}>
                      {i.isPrivate ? '[비밀] ' : ''}{i.title}
                    </td>
                    <td className={styles.td}>
                      {i.hasReply ? (
                        <span className={styles.replyDone}>답변완료</span>
                      ) : (
                        <span className={styles.replyPending}>—</span>
                      )}
                    </td>
                    <td className={styles.td}>
                      <span className={styles.contentPreview}>
                        {i.content || '—'}
                      </span>
                    </td>
                    <td className={`${styles.td} ${styles.dateCell}`}>
                      {formatDate(i.createdAt)}
                    </td>
                    <td className={styles.td}>
                      <div className={styles.actions}>
                        <Link href={`/admin/inquiries/${i.id}`} className={styles.actionBtn}>
                          상세
                        </Link>
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
