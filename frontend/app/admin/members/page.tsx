'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useUIStore } from '@/stores/uiStore';
import {
  fetchAdminMembers,
  fetchAdminMemberRoleCounts,
  deleteAdminMember,
  type AdminMemberListResponse,
} from '@/services/adminMemberService';
import styles from './page.module.css';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: '관리자',
  USER: '일반회원',
  SUPER_ADMIN: '슈퍼관리자',
  CONTENT_ADMIN: '콘텐츠관리자',
  SUPPORT_ADMIN: '고객지원관리자',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: '활성',
  INACTIVE: '비활성',
  SUSPENDED: '정지',
  WITHDRAWN: '탈퇴',
};

export default function AdminMembersListPage() {
  const { setTitle } = useUIStore();
  const [data, setData] = useState<AdminMemberListResponse | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [roleCounts, setRoleCounts] = useState<Record<string, number> | null>(null);
  const [roleCountsLoading, setRoleCountsLoading] = useState(false);

  const size = 20;
  const hasFilter = Boolean(search || statusFilter || roleFilter || fromDate || toDate);

  useEffect(() => {
    setTitle('회원 관리');
  }, [setTitle]);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    fetchAdminMembers(page, size, search || undefined, {
      status: statusFilter || undefined,
      role: roleFilter || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    })
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
  }, [page, search, statusFilter, roleFilter, fromDate, toDate]);

  useEffect(() => {
    load();
  }, [load]);

  const loadRoleCounts = useCallback(() => {
    if (!hasFilter) {
      setRoleCounts(null);
      return;
    }
    setRoleCountsLoading(true);
    fetchAdminMemberRoleCounts({
      search: search || undefined,
      status: statusFilter || undefined,
      role: roleFilter || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    })
      .then(setRoleCounts)
      .catch(() => setRoleCounts(null))
      .finally(() => setRoleCountsLoading(false));
  }, [hasFilter, search, statusFilter, roleFilter, fromDate, toDate]);

  useEffect(() => {
    loadRoleCounts();
  }, [loadRoleCounts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(0);
  };

  const handleDelete = async (memberId: number, username: string) => {
    if (!confirm(`회원 "${username}"(ID: ${memberId})을(를) 삭제하시겠습니까? 연결된 주문·문의 등 데이터에 따라 삭제가 제한될 수 있습니다.`)) return;
    setDeletingId(memberId);
    try {
      await deleteAdminMember(memberId);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : '삭제에 실패했습니다.');
    } finally {
      setDeletingId(null);
    }
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
        <h3 className={styles.cardTitle}>회원 검색 · 필터</h3>
        <form onSubmit={handleSearch} className={styles.filterForm}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="member-search">
              검색어
            </label>
            <input
              id="member-search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="아이디 / 이름 / 이메일 검색"
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="member-status">
              계정 상태
            </label>
            <select
              id="member-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
              aria-label="상태 필터"
            >
              <option value="">전체 상태</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="member-role">
              역할
            </label>
            <select
              id="member-role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={styles.filterSelect}
              aria-label="역할 필터"
            >
              <option value="">전체 역할</option>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>가입일 범위</span>
            <div className={styles.dateRow}>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className={styles.dateInput}
                aria-label="가입일 시작"
              />
              <span className={styles.dateSep}>~</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className={styles.dateInput}
                aria-label="가입일 끝"
              />
            </div>
          </div>
          <div className={styles.filterActions}>
            <button type="submit" className={styles.searchBtn}>
              검색
            </button>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={() => {
                setSearchInput('');
                setSearch('');
                setStatusFilter('');
                setRoleFilter('');
                setFromDate('');
                setToDate('');
                setPage(0);
                setRoleCounts(null);
              }}
            >
              초기화
            </button>
          </div>
        </form>
      </section>

      {hasFilter && (
        <section className={styles.summaryCard}>
          <h3 className={styles.summaryTitle}>역할별 회원수</h3>
          {roleCountsLoading ? (
            <p className={styles.summaryLoading}>집계 중…</p>
          ) : roleCounts != null && Object.keys(roleCounts).length > 0 ? (
            <div className={styles.summaryRow}>
              {Object.entries(roleCounts)
                .sort(([a], [b]) => (ROLE_LABELS[a] ?? a).localeCompare(ROLE_LABELS[b] ?? b))
                .map(([roleKey, count]) => (
                  <span key={roleKey} className={styles.summaryItem}>
                    <strong>{ROLE_LABELS[roleKey] ?? roleKey}</strong> {count.toLocaleString()}명
                  </span>
                ))}
            </div>
          ) : roleCounts != null ? (
            <p className={styles.summaryEmpty}>해당 조건의 회원이 없습니다.</p>
          ) : null}
        </section>
      )}

      <section>
        <h3 className={styles.sectionTitle}>회원 목록</h3>
        {loading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : !data || data.content.length === 0 ? (
          <div className={styles.empty}>
            {search || statusFilter || roleFilter || fromDate || toDate
              ? '검색/필터 결과가 없습니다.'
              : '등록된 회원이 없습니다.'}
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
                    <th className={styles.th}>이메일</th>
                    <th className={styles.th}>역할</th>
                    <th className={styles.th}>상태</th>
                    <th className={styles.th}>최근 로그인</th>
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
                      <td className={styles.td}>{m.email ?? '—'}</td>
                      <td className={styles.td}>
                        <span
                          className={
                            m.role === 'ADMIN' || m.role?.startsWith('ADMIN') || m.role === 'SUPER_ADMIN'
                              ? styles.roleBadgeAdmin
                              : styles.roleBadgeUser
                          }
                        >
                          {ROLE_LABELS[m.role ?? ''] ?? m.role}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.statusBadge} data-status={m.status ?? 'ACTIVE'}>
                          {STATUS_LABELS[m.status ?? 'ACTIVE'] ?? m.status}
                        </span>
                      </td>
                      <td className={`${styles.td} ${styles.dateCell}`}>
                        {m.lastLoginAt
                          ? new Date(m.lastLoginAt).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
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
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                            onClick={() => handleDelete(m.id, m.username)}
                            disabled={deletingId === m.id}
                            title="삭제"
                          >
                            {deletingId === m.id ? '처리 중…' : '삭제'}
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
