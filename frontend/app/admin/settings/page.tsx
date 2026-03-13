'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { fetchAdminSettings, updateAdminSettings, type AdminSettingsDto } from '@/services/adminSettingsService';
import styles from './page.module.css';

export default function AdminSettingsPage() {
  const { setTitle } = useUIStore();
  const [settings, setSettings] = useState<AdminSettingsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setMessage(null);
    fetchAdminSettings()
      .then((data) => setSettings(data))
      .catch(() => setSettings(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setTitle('설정');
  }, [setTitle]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const updated = await updateAdminSettings(settings);
      setSettings(updated);
      setMessage({ type: 'success', text: '설정이 저장되었습니다.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : '저장에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: keyof AdminSettingsDto, value: string) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <p className={styles.pageLabel}>Settings</p>
          <h2 className={styles.pageTitle}>사이트 설정</h2>
        </div>
        <div className={styles.divider} />
        <p className={styles.loading}>설정을 불러오는 중...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <p className={styles.pageLabel}>Settings</p>
          <h2 className={styles.pageTitle}>사이트 설정</h2>
        </div>
        <div className={styles.divider} />
        <p className={styles.error}>설정을 불러올 수 없습니다.</p>
        <button type="button" className={styles.retryBtn} onClick={load}>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>Settings</p>
        <h2 className={styles.pageTitle}>사이트 설정</h2>
        <p className={styles.pageDesc}>사이트 기본 정보와 운영 설정을 관리합니다.</p>
      </div>
      <div className={styles.divider} />

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>기본 정보</h3>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="siteName">
              사이트명
            </label>
            <input
              id="siteName"
              type="text"
              className={styles.input}
              value={settings.siteName ?? ''}
              onChange={(e) => updateField('siteName', e.target.value)}
              placeholder="예: NCafe"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="businessHours">
              영업시간
            </label>
            <input
              id="businessHours"
              type="text"
              className={styles.input}
              value={settings.businessHours ?? ''}
              onChange={(e) => updateField('businessHours', e.target.value)}
              placeholder="예: 평일 09:00 - 21:00 / 주말 10:00 - 22:00"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="address">
              주소
            </label>
            <input
              id="address"
              type="text"
              className={styles.input}
              value={settings.address ?? ''}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="예: 서울시 강남구 테헤란로 123"
            />
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>연락처</h3>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="contactPhone">
              전화번호
            </label>
            <input
              id="contactPhone"
              type="text"
              className={styles.input}
              value={settings.contactPhone ?? ''}
              onChange={(e) => updateField('contactPhone', e.target.value)}
              placeholder="예: 02-1234-5678"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="contactEmail">
              이메일
            </label>
            <input
              id="contactEmail"
              type="email"
              className={styles.input}
              value={settings.contactEmail ?? ''}
              onChange={(e) => updateField('contactEmail', e.target.value)}
              placeholder="예: contact@ncafe.com"
            />
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>운영</h3>
          <div className={styles.fieldRow}>
            <input
              id="maintenanceMode"
              type="checkbox"
              className={styles.checkbox}
              checked={(settings.maintenanceMode ?? 'false') === 'true'}
              onChange={(e) => updateField('maintenanceMode', e.target.checked ? 'true' : 'false')}
            />
            <label className={styles.checkboxLabel} htmlFor="maintenanceMode">
              점검 모드 (활성화 시 일반 사용자에게 점검 안내가 노출될 수 있습니다)
            </label>
          </div>
        </div>

        {message && (
          <p className={message.type === 'success' ? styles.msgSuccess : styles.msgError}>{message.text}</p>
        )}

        <div className={styles.actions}>
          <button type="submit" className={styles.submitBtn} disabled={saving}>
            {saving ? '저장 중...' : '설정 저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
