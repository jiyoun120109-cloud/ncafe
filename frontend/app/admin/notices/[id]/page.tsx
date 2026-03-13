'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';
import {
  fetchAdminNotice,
  fetchAdminNoticePrev,
  fetchAdminNoticeNext,
  deleteAdminNotice,
  type AdminNoticeDto,
} from '@/services/adminNoticeService';
import styles from './page.module.css';

export default function AdminNoticeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { setTitle } = useUIStore();
  const id = params?.id ? Number(params.id) : null;
  const [notice, setNotice] = useState<AdminNoticeDto | null>(null);
  const [prevNotice, setPrevNotice] = useState<AdminNoticeDto | null>(null);
  const [nextNotice, setNextNotice] = useState<AdminNoticeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setTitle('공지사항');
  }, [setTitle]);

  useEffect(() => {
    if (id == null || isNaN(id)) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetchAdminNotice(id),
      fetchAdminNoticePrev(id),
      fetchAdminNoticeNext(id),
    ])
      .then(([n, prev, next]) => {
        setNotice(n);
        setPrevNotice(prev);
        setNextNotice(next);
      })
      .catch(() => setNotice(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (id == null || isNaN(id)) return;
    if (!confirm('이 공지를 삭제하시겠습니까?')) return;
    setDeleting(true);
    try {
      await deleteAdminNotice(id);
      router.push('/admin/notices');
    } catch (e) {
      alert(e instanceof Error ? e.message : '삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className={styles.page}><p className={styles.loading}>불러오는 중...</p></div>;
  if (!notice) return <div className={styles.page}><p>공지를 찾을 수 없습니다.</p><Link href="/admin/notices">목록</Link></div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>Notice</p>
        <h2 className={styles.pageTitle}>{notice.title}</h2>
        <p className={styles.meta}>
          {notice.noticeType ?? '일반'} · {new Date(notice.createdAt).toLocaleString('ko-KR')} · 조회 {notice.viewCount}
        </p>
      </div>
      <div className={styles.divider} />

      <section className={styles.card}>
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: notice.content || '' }}
        />
      </section>

      <div className={styles.footer}>
        <div className={styles.footerNav}>
          <Link href="/admin/notices" className={styles.listBtn}>← 공지사항 목록</Link>
          <div className={styles.prevNext}>
            {prevNotice ? (
              <Link href={`/admin/notices/${prevNotice.id}`} className={styles.prevNextBtn}>
                ← 이전: {prevNotice.title.length > 18 ? prevNotice.title.slice(0, 18) + '…' : prevNotice.title}
              </Link>
            ) : (
              <span className={styles.prevNextDisabled}>← 이전 없음</span>
            )}
            {nextNotice ? (
              <Link href={`/admin/notices/${nextNotice.id}`} className={styles.prevNextBtn}>
                {nextNotice.title.length > 18 ? nextNotice.title.slice(0, 18) + '…' : nextNotice.title} 다음 →
              </Link>
            ) : (
              <span className={styles.prevNextDisabled}>다음 없음 →</span>
            )}
          </div>
        </div>
        <div className={styles.actions}>
          <Link href={`/admin/notices/${id}/edit`} className={styles.editBtn}>수정</Link>
          <button type="button" onClick={handleDelete} disabled={deleting} className={styles.deleteBtn}>
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  );
}
