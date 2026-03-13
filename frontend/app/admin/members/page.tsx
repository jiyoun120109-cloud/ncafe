'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useUIStore } from '@/stores/uiStore';
import {
  fetchAdminMembers,
  type AdminMemberListResponse,
} from '@/services/adminMemberService';
import styles from './page.module.css';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: '관리자',
  USER: '일반회원',
};

export default function AdminMembersListPage() {
  const { setTitle } = useUIStore();
  const [data, setData] = useState<AdminMemberListResponse | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);

  const size = 20;

  useEffect(() => {
    setTitle('회원 관리');
  }, [setTitle]);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    fetchAdminMembers(page, size, search || undefined)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(0);
  };

  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>Members</p>
        <h2 className={styles.pageTitle}>회원 관리</h2>
      </div>
      <div className={styles.divider} />

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>회원 검색</h3>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="아이디(닉네임) 검색"
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn}>
            검색
          </button>
        </form>
      </section>

      <section>
        <h3 className={styles.sectionTitle}>회원 목록</h3>
        {loading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : !data || data.content.length === 0 ? (
          <div className={styles.empty}>
            {search ? '검색 결과가 없습니다.' : '등록된 회원이 없습니다.'}
          </div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>ID</th>
                    <th className={styles.th}>아이디</th>
                    <th className={styles.th}>이름</th>
                    <th className={styles.th}>역할</th>
                    <th className={styles.th}>가입일</th>
                    <th className={styles.th}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((m) => (
                    <tr key={m.id} className={styles.tr}>
                      <td className={`${styles.td} ${styles.idCell}`}>{m.id}</td>
                      <td className={styles.td}>{m.username}</td>
                      <td className={styles.td}>{m.name ?? '—'}</td>
                      <td className={styles.td}>
                        <span
                          className={
                            m.role === 'ADMIN'
                              ? styles.roleBadgeAdmin
                              : styles.roleBadgeUser
                          }
                        >
                          {ROLE_LABELS[m.role] ?? m.role}
                        </span>
                      </td>
                      <td className={`${styles.td} ${styles.dateCell}`}>
                        {new Date(m.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className={styles.td}>
                        <div className={styles.actions}>
                          <Link href={`/admin/members/${m.id}`} className={styles.actionBtn}>
                            수정
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <nav className={styles.pagination} aria-label="페이지네이션">
                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={page <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  이전
                </button>
                <span className={styles.pageInfo}>
                  {page + 1} / {totalPages} (총 {totalElements}명)
                </span>
                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  다음
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}
