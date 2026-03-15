'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getApiBase } from '@/services/api';
import styles from './page.module.css';

interface InquiryDetail {
  id: number;
  userId: number;
  inquiryType?: string | null;
  title: string;
  content: string;
  isPrivate: boolean;
  attachmentUrl?: string | null;
  createdAt: string;
  replies: { id: number; content: string; authorId?: number; createdAt: string }[];
}

export default function AdminInquiryDetailPage() {
  const params = useParams();
  const id = params?.id ? Number(params.id) : null;
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id == null || isNaN(id)) return;
    fetch(`${getApiBase()}/admin/inquiries/${id}`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then(setInquiry)
      .catch(() => setInquiry(null));
  }, [id]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !replyContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${getApiBase()}/admin/inquiries/${id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: replyContent.trim() }),
      });
      if (!res.ok) throw new Error('답변 등록 실패');
      const reply = await res.json();
      setInquiry((prev) => (prev ? { ...prev, replies: [...(prev.replies || []), reply] } : null));
      setReplyContent('');
    } finally {
      setSubmitting(false);
    }
  };

  if (!inquiry) {
    return (
      <div className={styles.page}>
        <p>불러오는 중이거나 문의가 없습니다.</p>
        <Link href="/admin/inquiries" className={styles.backLink}>← 목록</Link>
      </div>
    );
  }

  const attachmentHref = inquiry.attachmentUrl
    ? (inquiry.attachmentUrl.startsWith('http') ? inquiry.attachmentUrl : inquiry.attachmentUrl.startsWith('/') ? inquiry.attachmentUrl : `/${inquiry.attachmentUrl}`)
    : null;

  return (
    <div className={styles.page}>
      <Link href="/admin/inquiries" className={styles.backLink}>← 문의 목록</Link>
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>Inquiry</p>
        <h2 className={styles.pageTitle}>{inquiry.isPrivate ? '[비밀] ' : ''}{inquiry.title}</h2>
        <dl className={styles.infoList}>
          <div className={styles.infoRow}>
            <dt>문의항목</dt>
            <dd>{inquiry.inquiryType ?? '—'}</dd>
          </div>
          <div className={styles.infoRow}>
            <dt>작성자 ID</dt>
            <dd>{inquiry.userId}</dd>
          </div>
          <div className={styles.infoRow}>
            <dt>작성일시</dt>
            <dd>{new Date(inquiry.createdAt).toLocaleString('ko-KR')}</dd>
          </div>
        </dl>
      </div>
      <div className={styles.divider} />

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>문의 내용</h3>
        <div className={styles.content}>{inquiry.content}</div>
        {attachmentHref && (
          <div className={styles.attachmentBlock}>
            <span className={styles.attachmentLabel}>첨부파일</span>
            <a href={attachmentHref} target="_blank" rel="noopener noreferrer" className={styles.attachmentLink}>
              첨부파일 보기 / 다운로드
            </a>
          </div>
        )}
      </section>

      {inquiry.replies?.length ? (
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>답변</h3>
          <ul className={styles.replyList}>
            {inquiry.replies.map((r) => (
              <li key={r.id} className={styles.replyItem}>
                <div className={styles.replyMeta}>
                  {new Date(r.createdAt).toLocaleString('ko-KR')}
                </div>
                <div className={styles.replyContent}>{r.content}</div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>답변</h3>
          <p style={{ fontSize: '0.875rem', color: 'rgba(0,0,0,0.5)' }}>아직 답변이 없습니다.</p>
        </section>
      )}

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>답변 작성</h3>
        <form onSubmit={handleReply}>
          <div className={styles.formRow}>
            <label className={styles.label} htmlFor="reply-content">
              내용 *
            </label>
            <textarea
              id="reply-content"
              className={styles.textarea}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="답변 내용을 입력하세요."
              required
            />
          </div>
          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting || !replyContent.trim()}
            >
              {submitting ? '등록 중…' : '답변 등록 (작성자에게 알림 발송)'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
