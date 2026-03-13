'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';
import {
  fetchAdminMember,
  updateAdminMemberRole,
  type AdminMemberDetailDto,
} from '@/services/adminMemberService';
import styles from './page.module.css';

const ROLE_OPTIONS = [
  { value: 'USER', label: '일반회원' },
  { value: 'ADMIN', label: '관리자' },
];

export default function AdminMemberDetailPage() {
  const params = useParams();
  const { setTitle } = useUIStore();
  const id = params?.id ? Number(params.id) : null;
  const [member, setMember] = useState<AdminMemberDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roleInput, setRoleInput] = useState<string>('USER');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setTitle('회원 관리');
  }, [setTitle]);

  useEffect(() => {
    if (id == null || isNaN(id)) {
      setLoading(false);
      return;
    }
    fetchAdminMember(id)
      .then((m) => {
        setMember(m);
        setRoleInput(m.role || 'USER');
      })
      .catch(() => setMember(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id == null || isNaN(id) || !member) return;
    if (roleInput === member.role) {
      setMessage('변경 사항이 없습니다.');
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const updated = await updateAdminMemberRole(id, roleInput);
      setMember(updated);
      setMessage('역할이 변경되었습니다.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '역할 변경에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.loading}>불러오는 중...</p>
      </div>
    );
  }
  if (!member) {
    return (
      <div className={styles.page}>
        <p>회원을 찾을 수 없습니다.</p>
        <Link href="/admin/members">목록으로</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>Member</p>
        <h2 className={styles.pageTitle}>회원 상세</h2>
      </div>
      <div className={styles.divider} />

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>회원 정보</h3>
        <dl className={styles.infoList}>
          <div className={styles.infoRow}>
            <dt>ID</dt>
            <dd>{member.id}</dd>
          </div>
          <div className={styles.infoRow}>
            <dt>아이디</dt>
            <dd>{member.username}</dd>
          </div>
          <div className={styles.infoRow}>
            <dt>이름</dt>
            <dd>{member.name ?? '—'}</dd>
          </div>
          <div className={styles.infoRow}>
            <dt>이메일</dt>
            <dd>{member.email ?? '—'}</dd>
          </div>
          <div className={styles.infoRow}>
            <dt>가입일</dt>
            <dd>
              {new Date(member.createdAt).toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt>수정일</dt>
            <dd>
              {member.updatedAt
                ? new Date(member.updatedAt).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '—'}
            </dd>
          </div>
        </dl>
      </section>

      <section className={styles.roleSection} aria-labelledby="role-heading">
        <h3 id="role-heading" className={styles.roleHeading}>
          역할 · 권한
        </h3>
        <p className={styles.roleDesc}>
          회원의 역할을 변경할 수 있습니다. 관리자(ADMIN)는 관리자 페이지 접근 및 회원 관리 등이 가능합니다.
        </p>
        <form onSubmit={handleSaveRole} className={styles.roleForm}>
          <label className={styles.roleLabel}>
            <span>역할</span>
            <select
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              className={styles.roleSelect}
              disabled={saving}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? '저장 중…' : '역할 저장'}
          </button>
        </form>
        {message && (
          <p className={styles.message} role="status">
            {message}
          </p>
        )}
      </section>

      <div className={styles.footer}>
        <Link href="/admin/members" className={styles.backLink}>
          ← 회원 목록
        </Link>
      </div>
    </div>
  );
}
