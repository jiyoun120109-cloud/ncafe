'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getNotice, type NoticeDto } from '@/services/noticeService';
import styles from './page.module.css';

export default function NoticeDetailPage() {
  const params = useParams();
  const id = params?.id ? Number(params.id) : null;
  const [notice, setNotice] = useState<NoticeDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id == null || isNaN(id)) {
      setLoading(false);
      return;
    }
    getNotice(id)
      .then(setNotice)
      .catch(() => setNotice(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main className={styles.main}><div className={styles.loading}>불러오는 중...</div></main>;
  if (!notice) return <main className={styles.main}><p className={styles.errorText}>공지를 찾을 수 없습니다.</p><Link href="/notices" className={styles.backLinkText}>← 이전으로</Link></main>;

  return (
    <main className={styles.main}>
      <div className={styles.page}>
        <Link href="/notices" className={styles.backLinkText}>← 이전으로</Link>
        <div className={styles.pageHeader}>
          <p className={styles.pageLabel}>Notice</p>
          <h1 className={styles.pageTitle}>{notice.title}</h1>
          <p className={styles.date}>{new Date(notice.createdAt).toLocaleString('ko-KR')}</p>
        </div>
        <div className={styles.card}>
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: notice.content || '' }}
          />
        </div>
      </div>
    </main>
  );
}
