'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { getMeApi } from '@/services/authService';
import {
  fetchAdminMember,
  updateAdminMemberProfile,
  resetAdminMemberPassword,
  updateAdminMemberStatus,
  unlockAdminMember,
  updateAdminMemberRole,
  type AdminMemberDetailWithActivityDto,
} from '@/services/adminMemberService';
import AddressField from '@/components/AddressField/AddressField';
import { validateAddress } from '@/lib/addressValidation';
import styles from './page.module.css';

const ROLE_OPTIONS = [
  { value: 'USER', label: '일반회원' },
  { value: 'ADMIN', label: '관리자' },
  { value: 'SUPER_ADMIN', label: '슈퍼관리자' },
  { value: 'CONTENT_ADMIN', label: '콘텐츠관리자' },
  { value: 'SUPPORT_ADMIN', label: '고객지원관리자' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: '활성' },
  { value: 'INACTIVE', label: '비활성' },
  { value: 'SUSPENDED', label: '정지' },
  { value: 'WITHDRAWN', label: '탈퇴' },
];

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
};

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('ko-KR', DATE_TIME_OPTIONS);
  } catch {
    return '—';
  }
}

export default function AdminMemberDetailPage() {
  const params = useParams();
  const { setTitle } = useUIStore();
  const { user: currentUser, setUser } = useAuthStore();
  const id = params?.id ? Number(params.id) : null;
  const [data, setData] = useState<AdminMemberDetailWithActivityDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const [profileDisplayNickname, setProfileDisplayNickname] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [roleInput, setRoleInput] = useState<string>('USER');
  const [statusInput, setStatusInput] = useState<string>('ACTIVE');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  useEffect(() => {
    setTitle('회원 관리');
  }, [setTitle]);

  const refresh = () => {
    if (id == null || isNaN(id)) return;
    fetchAdminMember(id)
      .then((res) => {
        setData(res);
        const m = res.member;
        setProfileDisplayNickname(m.displayNickname ?? '');
        setProfileName(m.name ?? '');
        setProfileEmail(m.email ?? '');
        setProfilePhone(m.phone ?? '');
        setProfileAddress(m.address ?? '');
        setRoleInput(m.role ?? 'USER');
        setStatusInput(m.status ?? 'ACTIVE');
      })
      .catch(() => setData(null));
  };

  /** 수정한 회원이 현재 로그인 사용자이면 헤더(역할·이름 등) 반영을 위해 세션 재조회 */
  const refreshCurrentUserIfMe = () => {
    if (id == null || currentUser == null) return;
    if (Number(currentUser.id) !== Number(id)) return;
    getMeApi().then((me) => { if (me) setUser(me); });
  };

  useEffect(() => {
    if (id == null || isNaN(id)) {
      setLoading(false);
      return;
    }
    fetchAdminMember(id)
      .then((res) => {
        setData(res);
        const m = res.member;
        setProfileDisplayNickname(m.displayNickname ?? '');
        setProfileName(m.name ?? '');
        setProfileEmail(m.email ?? '');
        setProfilePhone(m.phone ?? '');
        setProfileAddress(m.address ?? '');
        setRoleInput(m.role ?? 'USER');
        setStatusInput(m.status ?? 'ACTIVE');
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  const [addressError, setAddressError] = useState<string | null>(null);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id == null || isNaN(id)) return;
    const addrErr = validateAddress(profileAddress, { required: false });
    if (addrErr) {
      setAddressError(addrErr);
      return;
    }
    setAddressError(null);
    setSaving(true);
    setMessage(null);
    try {
      await updateAdminMemberProfile(id, {
        displayNickname: profileDisplayNickname.trim() || null,
        name: profileName.trim() || null,
        email: profileEmail.trim() || null,
        phone: profilePhone.trim() || null,
        address: profileAddress.trim() || null,
      });
      await updateAdminMemberStatus(id, statusInput);
      await updateAdminMemberRole(id, roleInput);
      setMessage('프로필·상태·역할이 저장되었습니다.');
      setMessageType('success');
      refresh();
      refreshCurrentUserIfMe();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '저장에 실패했습니다.');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id == null || isNaN(id) || newPassword.length < 6) {
      setMessage('비밀번호는 6자 이상 입력해주세요.');
      setMessageType('error');
      return;
    }
    setMessage(null);
    setShowResetConfirmModal(true);
  };

  const handleConfirmResetWithNotification = async () => {
    if (id == null || isNaN(id) || newPassword.length < 6) return;
    setSaving(true);
    setShowResetConfirmModal(false);
    setMessage(null);
    try {
      await resetAdminMemberPassword(id, newPassword, true);
      setMessage('비밀번호가 초기화되었고, 해당 회원에게 알림을 보냈습니다.');
      setMessageType('success');
      setNewPassword('');
      setShowPasswordForm(false);
      refresh();
      refreshCurrentUserIfMe();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '비밀번호 초기화에 실패했습니다.');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleUnlock = async () => {
    if (id == null || isNaN(id)) return;
    setSaving(true);
    setMessage(null);
    try {
      await unlockAdminMember(id);
      setMessage('계정 잠금이 해제되었습니다.');
      setMessageType('success');
      refresh();
      refreshCurrentUserIfMe();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '잠금 해제에 실패했습니다.');
      setMessageType('error');
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
  if (!data) {
    return (
      <div className={styles.page}>
        <p>회원을 찾을 수 없습니다.</p>
        <Link href="/admin/members">목록으로</Link>
      </div>
    );
  }

  const member = data.member;
  const isLocked = member.lockedUntil && new Date(member.lockedUntil) > new Date();

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>Member</p>
        <h2 className={styles.pageTitle}>회원 상세</h2>
      </div>
      <div className={styles.divider} />

      {message && (
        <p className={messageType === 'error' ? styles.messageError : styles.message} role="status">
          {message}
        </p>
      )}

      <div className={styles.twoCol}>
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
              <dt>닉네임</dt>
              <dd>{member.displayNickname ?? member.username ?? '—'}</dd>
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
              <dt>연락처</dt>
              <dd>{member.phone ?? '—'}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>주소</dt>
              <dd>{member.address ?? '—'}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>비밀번호</dt>
              <dd>설정됨</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>계정상태</dt>
              <dd>{STATUS_OPTIONS.find((o) => o.value === member.status)?.label ?? member.status ?? '—'}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>역할권한</dt>
              <dd>{ROLE_OPTIONS.find((o) => o.value === member.role)?.label ?? member.role ?? '—'}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>가입일</dt>
              <dd>{formatDateTime(member.createdAt)}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>최근 로그인</dt>
              <dd>{formatDateTime(member.lastLoginAt)}</dd>
            </div>
            {isLocked && (
              <div className={styles.infoRow}>
                <dt>잠금 해제 시각</dt>
                <dd>{formatDateTime(member.lockedUntil ?? undefined)}</dd>
              </div>
            )}
            {member.loginFailCount != null && member.loginFailCount > 0 && (
              <div className={styles.infoRow}>
                <dt>로그인 실패 횟수</dt>
                <dd>{member.loginFailCount}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className={styles.card}>
          <h3 className={styles.cardTitle}>정보 수정</h3>
          <form onSubmit={handleSaveAll} className={styles.form}>
            <div className={styles.formRow}>
              <label className={styles.label}>
                <span>닉네임</span>
                <input
                  type="text"
                  value={profileDisplayNickname}
                  onChange={(e) => setProfileDisplayNickname(e.target.value)}
                  className={styles.input}
                  placeholder="표시 닉네임"
                  disabled={saving}
                />
              </label>
            </div>
            <div className={styles.formRow}>
              <label className={styles.label}>
                <span>이름</span>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className={styles.input}
                  placeholder="실명"
                  disabled={saving}
                />
              </label>
            </div>
            <div className={styles.formRow}>
              <label className={styles.label}>
                <span>이메일</span>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className={styles.input}
                  placeholder="email@example.com"
                  disabled={saving}
                />
              </label>
            </div>
            <div className={styles.formRow}>
              <label className={styles.label}>
                <span>연락처</span>
                <input
                  type="text"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className={styles.input}
                  placeholder="010-0000-0000"
                  disabled={saving}
                />
              </label>
            </div>
            <div className={styles.formRow}>
              <label className={styles.label}>
                <span>주소</span>
                <AddressField
                  address={profileAddress}
                  onAddressChange={(v) => {
                    setProfileAddress(v);
                    setAddressError(null);
                  }}
                  error={addressError}
                  disabled={saving}
                  showDetail={false}
                />
              </label>
            </div>
            <div className={styles.formRow}>
              <label className={styles.roleLabel}>
                <span>계정상태</span>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className={styles.roleSelect}
                  disabled={saving}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {isLocked && (
              <div className={styles.unlockRow}>
                <button type="button" className={styles.unlockBtn} onClick={handleUnlock} disabled={saving}>
                  잠금 해제
                </button>
              </div>
            )}
            <div className={styles.formRow}>
              <label className={styles.roleLabel}>
                <span>역할권한</span>
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
            </div>
            <div className={styles.formCardActions}>
              <button type="submit" className={styles.saveBtn} disabled={saving}>
                {saving ? '저장 중…' : '한 번에 저장'}
              </button>
            </div>
          </form>

          <h4 className={styles.editSubTitle}>비밀번호</h4>
          {!showPasswordForm ? (
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => setShowPasswordForm(true)}
            >
              비밀번호 초기화
            </button>
          ) : (
            <form onSubmit={handleResetPasswordSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <label className={styles.label}>
                  <span>새 비밀번호 (6자 이상)</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={styles.input}
                    minLength={6}
                    autoComplete="new-password"
                    disabled={saving}
                  />
                </label>
              </div>
              <div className={styles.buttonRow}>
                <button type="submit" className={styles.saveBtn} disabled={saving || newPassword.length < 6}>
                  {saving ? '처리 중…' : '초기화'}
                </button>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => { setShowPasswordForm(false); setNewPassword(''); }}
                  disabled={saving}
                >
                  취소
                </button>
              </div>
            </form>
          )}
        </section>
      </div>

      {(data.recentOrders?.length > 0 || data.recentInquiries?.length > 0 || data.recentLoginLogs?.length > 0 || (data.recentFavorites?.length ?? 0) > 0) && (
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>최근 활동</h3>
          <div className={styles.activityGrid}>
            {data.recentOrders && data.recentOrders.length > 0 && (
              <div className={styles.activityBlock}>
                <h4 className={styles.activityTitle}>최근 주문</h4>
                <div className={styles.tableWrap}>
                  <table className={styles.miniTable}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>상태</th>
                        <th>금액</th>
                        <th>일시</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentOrders.map((o) => (
                        <tr key={o.id}>
                          <td>{o.id}</td>
                          <td>{o.status}</td>
                          <td>{o.totalAmount?.toLocaleString() ?? '—'}</td>
                          <td>{o.createdAt ? new Date(o.createdAt).toLocaleString('ko-KR') : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {data.recentLoginLogs && data.recentLoginLogs.length > 0 && (
              <div className={styles.activityBlock}>
                <h4 className={styles.activityTitle}>최근 로그인 기록</h4>
                <div className={styles.tableWrap}>
                  <table className={styles.miniTable}>
                    <thead>
                      <tr>
                        <th>성공</th>
                        <th>IP</th>
                        <th>일시</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentLoginLogs.map((log, idx) => (
                        <tr key={idx}>
                          <td>{log.success ? '성공' : '실패'}</td>
                          <td>{log.ipAddress ?? '—'}</td>
                          <td>{log.createdAt ? new Date(log.createdAt).toLocaleString('ko-KR') : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {data.recentInquiries && data.recentInquiries.length > 0 && (
              <div className={styles.activityBlock}>
                <h4 className={styles.activityTitle}>최근 문의</h4>
                <div className={styles.tableWrap}>
                  <table className={styles.miniTable}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>제목</th>
                        <th>일시</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentInquiries.map((i) => (
                        <tr key={i.id}>
                          <td>{i.id}</td>
                          <td>{i.title}</td>
                          <td>{i.createdAt ? new Date(i.createdAt).toLocaleString('ko-KR') : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {data.recentFavorites && data.recentFavorites.length > 0 && (
              <div className={styles.activityBlock}>
                <h4 className={styles.activityTitle}>좋아요 선택 제품</h4>
                <div className={styles.tableWrap}>
                  <table className={styles.miniTable}>
                    <thead>
                      <tr>
                        <th>메뉴 ID</th>
                        <th>메뉴명</th>
                        <th>선택일시</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentFavorites.map((f, idx) => (
                        <tr key={f.menuId != null ? `${f.menuId}-${idx}` : idx}>
                          <td>{f.menuId ?? '—'}</td>
                          <td>{f.menuName ?? '—'}</td>
                          <td>{f.createdAt ? new Date(f.createdAt).toLocaleString('ko-KR') : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <div className={styles.footer}>
        <Link href="/admin/members" className={styles.backLink}>
          ← 회원 목록
        </Link>
      </div>

      {showResetConfirmModal && (
        <div className={styles.resetConfirmOverlay} role="dialog" aria-modal="true" aria-labelledby="reset-confirm-title">
          <div className={styles.resetConfirmModal}>
            <h3 id="reset-confirm-title" className={styles.resetConfirmTitle}>알림 전송 확인</h3>
            <p className={styles.resetConfirmMessage}>
              비밀번호를 초기화하고 해당 회원에게 알림을 보낼까요?
            </p>
            <div className={styles.resetConfirmActions}>
              <button
                type="button"
                className={styles.resetConfirmCancel}
                onClick={() => setShowResetConfirmModal(false)}
                disabled={saving}
              >
                취소
              </button>
              <button
                type="button"
                className={styles.resetConfirmSubmit}
                onClick={handleConfirmResetWithNotification}
                disabled={saving}
              >
                전달
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
