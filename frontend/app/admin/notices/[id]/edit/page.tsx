'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';
import { fetchAdminNotice, updateAdminNotice } from '@/services/adminNoticeService';
import styles from '../../page.module.css';

const RichEditor = dynamic(() => import('@/app/admin/notices/_components/RichEditor/RichEditor'), {
  ssr: false,
  loading: () => <div style={{ minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf9', borderRadius: 8, color: '#78716c' }}>에디터 로딩 중...</div>,
});

const NOTICE_TYPE_OPTIONS = [
  { value: '일반', label: '일반' },
  { value: '이벤트', label: '이벤트' },
  { value: '점검', label: '점검' },
  { value: '안내', label: '안내' },
];

export default function AdminNoticeEditPage() {
  const params = useParams();
  const router = useRouter();
  const { setTitle } = useUIStore();
  const id = params?.id ? Number(params.id) : null;
  const [mounted, setMounted] = useState(false);
  const [noticeType, setNoticeType] = useState('일반');
  const [title, setTitleInput] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setTitle('공지 수정');
  }, [setTitle]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (id == null || isNaN(id)) {
      setLoading(false);
      return;
    }
    fetchAdminNotice(id, false)
      .then((n) => {
        setNoticeType(n.noticeType ?? '일반');
        setTitleInput(n.title);
        setContent(n.content ?? '');
        setIsPinned(n.isPinned ?? false);
      })
      .catch(() => setError('공지를 불러올 수 없습니다.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || isNaN(id) || !title.trim()) {
      setError('제목을 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await updateAdminNotice(id, {
        noticeType: noticeType || undefined,
        title: title.trim(),
        content: content.trim() || undefined,
        isPinned,
      });
      router.push(`/admin/notices/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : '수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className={styles.page}>
        <div className={styles.narrowPageWrap}>
          <div className={styles.pageHeader}>
            <p className={styles.pageLabel}>Notice</p>
            <h2 className={styles.pageTitle}>공지 수정</h2>
          </div>
          <div className={styles.divider} />
          <p className={styles.loading}>페이지 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className={styles.page}><div className={styles.narrowPageWrap}><p className={styles.loading}>불러오는 중...</p></div></div>;

  return (
    <div className={styles.page}>
      <div className={styles.narrowPageWrap}>
        <div className={styles.pageHeader}>
          <p className={styles.pageLabel}>Notice</p>
          <h2 className={styles.pageTitle}>공지 수정</h2>
        </div>
        <div className={styles.divider} />

        <section className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formInner}>
              <div className={styles.formRowGroup}>
                <label className={styles.formLabel}>
                  구분
                  <select
                    value={noticeType}
                    onChange={(e) => setNoticeType(e.target.value)}
                    className={styles.select}
                  >
                    {NOTICE_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </label>
                <label className={styles.formLabelCheck}>
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>상단 고정</span>
                </label>
              </div>
              <label className={styles.formLabel}>
                <span className={styles.formLabelText}>제목<span className={styles.required}>*</span></span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className={styles.input}
                  required
                />
              </label>
              <div className={styles.formLabel}>
                <span className={styles.formLabelText}>내용</span>
                <RichEditor
                  value={content}
                  onChange={setContent}
                  placeholder="내용을 입력하세요. 글자 크기, 굵기, 색상, 이미지·첨부파일 등을 사용할 수 있습니다."
                  minHeight={320}
                />
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <div className={styles.formActions}>
                <button type="button" onClick={() => setShowPreview((v) => !v)} className={styles.previewToggleBtn}>
                  {showPreview ? '미리보기 닫기' : '미리보기'}
                </button>
                <Link href={`/admin/notices/${id}`} className={styles.cancelBtn}>취소</Link>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? '저장 중...' : '저장'}
                </button>
              </div>
              {showPreview && (
                <div className={styles.previewWrap}>
                  <div className={styles.previewHeader}>
                    <span>미리보기</span>
                    <button type="button" onClick={() => setShowPreview(false)} className={styles.previewClose}>
                      닫기
                    </button>
                  </div>
                  <div className={styles.previewBody}>
                    {title.trim() ? <div className={styles.previewTitle}>{title}</div> : null}
                    <div className={styles.previewContent}>
                      {content.trim() ? (
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                      ) : (
                        <p className={styles.previewEmpty}>내용이 없습니다.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
