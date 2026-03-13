'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getNotices, type NoticeDto } from '@/services/noticeService';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import PageWithHero from '@/components/PageWithHero/PageWithHero';
import styles from './page.module.css';

export default function NoticesPage() {
  const [list, setList] = useState<NoticeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { siteName } = useSiteSettings();

  useEffect(() => {
    getNotices()
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  const total = list.length;

  return (
    <PageWithHero title="공지사항" subtitle={`${siteName || 'NCafe'}의 소식을 전해 드립니다.`}>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <p className={styles.pageLabel}>Notice</p>
          <h2 className={styles.pageTitle}>공지사항</h2>
        </div>
        <div className={styles.topRow}>
          <Link href="/" className={styles.backLinkText}>← 이전으로</Link>
        </div>
        {loading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : list.length === 0 ? (
          <div className={styles.empty}>등록된 공지가 없습니다.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>번호</th>
                  <th className={styles.th}>제목</th>
                  <th className={styles.th}>글쓴이</th>
                  <th className={styles.th}>작성날짜</th>
                </tr>
              </thead>
              <tbody>
                {list.map((n, index) => (
                  <tr key={n.id} className={styles.tr}>
                    <td className={`${styles.td} ${styles.idCell}`}>{total - index}</td>
                    <td className={`${styles.td} ${styles.cellTitle}`}>
                      <Link href={`/notices/${n.id}`}>{n.title}</Link>
                    </td>
                    <td className={styles.td}>관리자</td>
                    <td className={`${styles.td} ${styles.dateCell}`}>
                      {new Date(n.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageWithHero>
  );
}
