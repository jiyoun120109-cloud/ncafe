'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { createInquiry, uploadInquiryAttachment } from '@/services/inquiryService';
import styles from './page.module.css';

const INQUIRY_TYPES = [
  { value: '', label: '선택하세요' },
  { value: 'GENERAL', label: '일반 문의' },
  { value: 'MENU', label: '메뉴/제품' },
  { value: 'ORDER', label: '주문/결제' },
  { value: 'STORE', label: '매장 이용' },
  { value: 'ETC', label: '기타' },
];

export default function NewInquiryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [inquiryType, setInquiryType] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAuthenticated) {
    router.replace(`/login?returnUrl=${encodeURIComponent('/inquiries/new')}`);
    return null;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { attachmentUrl: url } = await uploadInquiryAttachment(file);
      setAttachmentUrl(url);
      setAttachmentName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : '파일 업로드에 실패했습니다.');
      setAttachmentUrl(null);
      setAttachmentName(null);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = () => {
    setAttachmentUrl(null);
    setAttachmentName(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('제목을 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createInquiry({
        inquiryType: inquiryType || undefined,
        title: title.trim(),
        content: content.trim(),
        isPrivate,
        attachmentUrl: attachmentUrl ?? undefined,
      });
      router.push('/inquiries');
    } catch (err) {
      setError(err instanceof Error ? err.message : '등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.main}>
      <Link href="/inquiries" className={styles.backLink}>← 이전으로</Link>
      <h1 className={styles.title}>1:1 문의 작성</h1>
      <form onSubmit={handleSubmit}>
        <label className={styles.label}>
          문의 유형
          <select
            value={inquiryType}
            onChange={(e) => setInquiryType(e.target.value)}
            className={styles.select}
            aria-label="문의 유형 선택"
          >
            {INQUIRY_TYPES.map((opt) => (
              <option key={opt.value || 'empty'} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        <label className={styles.label}>
          제목
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={styles.input} required />
        </label>
        <label className={styles.label}>
          문의 내용
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className={styles.textarea} rows={6} placeholder="문의 내용을 입력해주세요." />
        </label>
        <div className={styles.label}>
          첨부 파일
          <div className={styles.fileRow}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
              onChange={handleFileChange}
              className={styles.fileInput}
              disabled={uploading}
            />
            <button type="button" className={styles.fileBtn} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? '업로드 중...' : '파일 선택'}
            </button>
            {attachmentName && (
              <span className={styles.fileName}>
                {attachmentName}
                <button type="button" className={styles.fileRemove} onClick={handleRemoveAttachment} aria-label="첨부 제거">×</button>
              </span>
            )}
          </div>
          {!attachmentName && <p className={styles.fileHint}>선택된 파일 없음</p>}
        </div>
        <label className={styles.checkbox}>
          <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
          비밀글로 작성
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.submitWrap}>
          <button type="submit" className={styles.submit} disabled={submitting}>{submitting ? '등록 중...' : '문의하기'}</button>
        </div>
      </form>
    </main>
  );
}
