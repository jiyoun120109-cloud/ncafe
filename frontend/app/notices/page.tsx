'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getNotices, type NoticeDto } from '@/services/noticeService';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import PageWithHero from '@/components/PageWithHero/PageWithHero';
import styles from './page.module.css';

const NOTICE_TYPE_LABELS: Record<string, string> = {
  NOTICE: '공지',
  EVENT: '이벤트',
  MAINTENANCE: '점검',
  ETC: '기타',
};

export default function NoticesPage() {
  const [list, setList] = useState<NoticeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const { siteName } = useSiteSettings();

  useEffect(() => {
    getNotices()
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = list;
    if (filterType) {
      result = result.filter((n) => (n.noticeType ?? '') === filterType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((n) =>
        (n.title ?? '').toLowerCase().includes(q) || (n.content ?? '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [list, filterType, searchQuery]);

  const typeOptions = useMemo(() => {
    const types = new Set<string>(list.map((n) => n.noticeType ?? 'ETC').filter(Boolean));
    return Array.from(types).sort();
  }, [list]);

  return (
    <PageWithHero title="공지사항" subtitle={`${siteName || 'NCafe'}의 소식을 전해 드립니다.`}>
      <div className={styles.page}>
        <div className={styles.topRow}>
          <Link href="/" className={styles.backLinkText}>← 이전으로</Link>
        </div>
        {!loading && list.length > 0 && (
          <div className={styles.toolbar}>
            <select
              className={styles.filterSelect}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              aria-label="유형 필터"
            >
              <option value="">전체 유형</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>{NOTICE_TYPE_LABELS[t] ?? t}</option>
              ))}
            </select>
            <div className={styles.searchRow}>
              <input
                type="search"
                className={styles.searchInput}
                placeholder="검색어를 입력하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="검색"
              />
              <button type="button" className={styles.searchBtn}>검색</button>
            </div>
          </div>
        )}
        {loading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>{list.length === 0 ? '등록된 공지가 없습니다.' : '검색 결과가 없습니다.'}</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>번호</th>
                  <th className={styles.th}>유형</th>
                  <th className={styles.th}>제목</th>
                  <th className={styles.th}>글쓴이</th>
                  <th className={styles.th}>작성날짜</th>
                  <th className={styles.th}>조회수</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((n, index) => (
                  <tr key={n.id} className={styles.tr}>
                    <td className={`${styles.td} ${styles.idCell}`}>{filtered.length - index}</td>
                    <td className={styles.td}>
                      <span className={styles.typeBadge}>{NOTICE_TYPE_LABELS[n.noticeType ?? ''] ?? n.noticeType ?? '—'}</span>
                    </td>
                    <td className={`${styles.td} ${styles.cellTitle}`}>
                      <Link href={`/notices/${n.id}`}>{n.title}</Link>
                    </td>
                    <td className={styles.td}>관리자</td>
                    <td className={`${styles.td} ${styles.dateCell}`}>
                      {new Date(n.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </td>
                    <td className={`${styles.td} ${styles.numCell}`}>{(n.viewCount ?? 0).toLocaleString()}</td>
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
