'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { createInquiry } from '@/services/inquiryService';
import styles from './page.module.css';

export default function NewInquiryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    router.replace(`/login?returnUrl=${encodeURIComponent('/inquiries/new')}`);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('제목을 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createInquiry({ title: title.trim(), content: content.trim(), isPrivate });
      router.push('/inquiries');
    } catch (e) {
      setError(e instanceof Error ? e.message : '등록에 실패했습니다.');
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
          제목
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={styles.input} required />
        </label>
        <label className={styles.label}>
          내용
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className={styles.textarea} rows={6} />
        </label>
        <label className={styles.checkbox}>
          <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
          비밀글로 작성
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.submit} disabled={submitting}>{submitting ? '등록 중...' : '등록'}</button>
      </form>
    </main>
  );
}
