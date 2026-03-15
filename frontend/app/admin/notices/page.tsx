'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useUIStore } from '@/stores/uiStore';
import { fetchAdminNotices, deleteAdminNotices, type AdminNoticeListResponse } from '@/services/adminNoticeService';
import styles from './page.module.css';

const NOTICE_TYPES: Record<string, string> = {
  일반: '일반',
  이벤트: '이벤트',
  점검: '점검',
  안내: '안내',
};

export default function AdminNoticesListPage() {
  const { setTitle } = useUIStore();
  const [data, setData] = useState<AdminNoticeListResponse | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const size = 10;
  const currentIds = data?.content.map((n) => n.id) ?? [];
  const allSelected = Boolean(data && data.content.length > 0 && currentIds.every((id) => selectedIds.has(id)));
  const someSelected = selectedIds.size > 0;

  useEffect(() => {
    setTitle('공지사항');
  }, [setTitle]);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    fetchAdminNotices(page, size, search || undefined)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(0);
  };

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.forEach((id) => {
        if (!currentIds.includes(id)) next.delete(id);
      });
      return next;
    });
  }, [page, search, data?.content]);

  const toggleSelectAll = () => {
    if (!data) return;
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        currentIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        currentIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`선택한 ${selectedIds.size}건의 공지를 삭제하시겠습니까?`)) return;
    setDeleting(true);
    try {
      await deleteAdminNotices(Array.from(selectedIds));
      setSelectedIds(new Set());
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : '삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteOne = async (id: number) => {
    if (!confirm('이 공지를 삭제하시겠습니까?')) return;
    setDeleting(true);
    try {
      await deleteAdminNotices([id]);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : '삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>Notice</p>
        <h2 className={styles.pageTitle}>공지사항 관리</h2>
      </div>
      <div className={styles.divider} />

      <section>
        <div className={styles.listHeader}>
          <h3 className={styles.sectionTitle}>공지사항 목록</h3>
          <div className={styles.listToolbar}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="제목·내용 검색"
                className={styles.searchInput}
                aria-label="제목·내용 검색"
              />
            </form>
            {someSelected && (
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={deleting}
                className={styles.deleteSelectedBtn}
              >
                {deleting ? '삭제 중…' : `선택 삭제 (${selectedIds.size}건)`}
              </button>
            )}
            <Link href="/admin/notices/new" className={styles.registerBtn}>
              공지 등록
            </Link>
          </div>
        </div>
        {loading ? (
          <div className={styles.loading}>불러오는 중…</div>
        ) : !data || data.content.length === 0 ? (
          <div className={styles.empty}>
            {search ? '검색 결과가 없습니다.' : '등록된 공지가 없습니다.'}
          </div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th} style={{ width: '3rem', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        aria-label="전체 선택"
                        className={styles.checkbox}
                      />
                    </th>
                    <th className={styles.th}>번호</th>
                    <th className={styles.th}>구분</th>
                    <th className={styles.th}>제목</th>
                    <th className={styles.th}>날짜</th>
                    <th className={styles.th}>조회수</th>
                    <th className={`${styles.th} ${styles.thActions}`}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((n, index) => (
                    <tr key={n.id} className={styles.tr}>
                      <td className={styles.td} style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(n.id)}
                          onChange={() => toggleSelect(n.id)}
                          aria-label={`공지 ${n.title} 선택`}
                          className={styles.checkbox}
                        />
                      </td>
                      <td className={`${styles.td} ${styles.idCell}`}>
                        {totalElements - (page * size + index)}
                      </td>
                      <td className={styles.td}>
                        {NOTICE_TYPES[n.noticeType || ''] ?? n.noticeType ?? '—'}
                      </td>
                      <td className={`${styles.td} ${styles.cellTitle}`}>
                        <Link href={`/admin/notices/${n.id}`}>{n.title}</Link>
                      </td>
                      <td className={`${styles.td} ${styles.dateCell}`}>
                        {new Date(n.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </td>
                      <td className={styles.td}>{n.viewCount}</td>
                      <td className={`${styles.td} ${styles.tdActions}`}>
                        <div className={styles.actions}>
                          <Link href={`/admin/notices/${n.id}/edit`} className={styles.actionBtn}>
                            수정
                          </Link>
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                            onClick={() => handleDeleteOne(n.id)}
                            disabled={deleting}
                          >
                            삭제
                          </button>
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
                {page + 1} / {totalPages} (총 {totalElements}건)
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
