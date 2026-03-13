'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PenLine, MessageCircle, Eye, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getMyInquiries, getInquiry, type InquiryDto } from '@/services/inquiryService';
import PageWithHero from '@/components/PageWithHero/PageWithHero';
import styles from './page.module.css';

export default function InquiriesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [list, setList] = useState<InquiryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [preview, setPreview] = useState<InquiryDto | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?returnUrl=${encodeURIComponent('/inquiries')}`);
      return;
    }
    getMyInquiries()
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  const openPreview = useCallback((id: number) => {
    setPreviewId(id);
    setPreview(null);
    setPreviewLoading(true);
    getInquiry(id)
      .then(setPreview)
      .catch(() => setPreview(null))
      .finally(() => setPreviewLoading(false));
  }, []);

  const closePreview = useCallback(() => {
    setPreviewId(null);
    setPreview(null);
  }, []);

  if (!isAuthenticated) return null;

  const total = list.length;
  const adminReplies = preview?.replies?.filter((r) => r.parentReplyId == null) ?? [];
  const firstReply = adminReplies[0];

  return (
    <PageWithHero title="1:1 문의" subtitle="궁금한 점을 남겨 주시면 답변 드립니다.">
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <p className={styles.pageLabel}>Inquiry</p>
          <h2 className={styles.pageTitle}>1:1 문의</h2>
        </div>
        <div className={styles.topRow}>
          <Link href="/" className={styles.backLinkText}>← 이전으로</Link>
          <Link href="/inquiries/new" className={styles.writeBtn}>
            <PenLine size={16} />
            글쓰기
          </Link>
        </div>
        {loading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : list.length === 0 ? (
          <div className={styles.empty}>문의 내역이 없습니다.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>번호</th>
                  <th className={styles.th}>제목</th>
                  <th className={styles.th}>답변</th>
                  <th className={styles.th}>글쓴이</th>
                  <th className={styles.th}>작성날짜</th>
                  <th className={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {list.map((i, index) => (
                  <tr key={i.id} className={styles.tr}>
                    <td className={`${styles.td} ${styles.idCell}`}>{total - index}</td>
                    <td className={`${styles.td} ${styles.cellTitle}`}>
                      <Link href={`/inquiries/${i.id}`}>{i.isPrivate ? '[비밀] ' : ''}{i.title}</Link>
                    </td>
                    <td className={styles.td}>
                      {i.hasReply ? (
                        <span className={styles.replyBadge} title="답변 있음">
                          <MessageCircle size={14} /> 답변
                        </span>
                      ) : (
                        <span className={styles.noReply}>—</span>
                      )}
                    </td>
                    <td className={styles.td}>나</td>
                    <td className={`${styles.td} ${styles.dateCell}`}>
                      {new Date(i.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </td>
                    <td className={`${styles.td} ${styles.previewCell}`}>
                      <button
                        type="button"
                        className={styles.previewBtn}
                        onClick={() => openPreview(i.id)}
                        title="미리보기"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {previewId != null && (
        <div className={styles.overlay} onClick={closePreview} role="presentation">
          <div className={styles.previewModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.previewHeader}>
              <h3 className={styles.previewTitle}>미리보기</h3>
              <button type="button" className={styles.closeBtn} onClick={closePreview} aria-label="닫기">
                <X size={20} />
              </button>
            </div>
            {previewLoading ? (
              <div className={styles.previewLoading}>불러오는 중...</div>
            ) : preview ? (
              <div className={styles.previewBody}>
                <p className={styles.previewLabel}>{preview.isPrivate ? '[비밀] ' : ''}{preview.title}</p>
                <p className={styles.previewDate}>
                  {new Date(preview.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                </p>
                <div className={styles.previewContent}>
                  {(preview.content || '').slice(0, 300)}
                  {(preview.content?.length ?? 0) > 300 && '…'}
                </div>
                {firstReply && (
                  <div className={styles.previewReply}>
                    <span className={styles.previewReplyLabel}>관리자 답변</span>
                    <p className={styles.previewReplyContent}>
                      {firstReply.content.slice(0, 200)}
                      {firstReply.content.length > 200 && '…'}
                    </p>
                  </div>
                )}
                <Link href={`/inquiries/${preview.id}`} className={styles.previewLink}>
                  전체 보기
                </Link>
              </div>
            ) : (
              <div className={styles.previewError}>불러올 수 없습니다.</div>
            )}
          </div>
        </div>
      )}
    </PageWithHero>
  );
}
