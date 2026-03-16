'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { fetchAdminSettings, updateAdminSettings, type AdminSettingsDto } from '@/services/adminSettingsService';
import AddressField from '@/components/AddressField/AddressField';
import { validateAddress, validateAddressDetail } from '@/lib/addressValidation';
import styles from './page.module.css';

export default function AdminSettingsPage() {
  const { setTitle } = useUIStore();
  const [settings, setSettings] = useState<AdminSettingsDto | null>(null);
  const [addressDetail, setAddressDetail] = useState('');
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressDetailError, setAddressDetailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setMessage(null);
    setAddressDetail('');
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
    setAddressError(null);
    setAddressDetailError(null);
    const addrErr = validateAddress(settings.address ?? '', { required: false });
    const detailErr = validateAddressDetail(addressDetail);
    if (addrErr) setAddressError(addrErr);
    if (detailErr) setAddressDetailError(detailErr);
    if (addrErr || detailErr) return;
    setSaving(true);
    setMessage(null);
    try {
      const combinedAddress = [settings.address ?? '', addressDetail.trim()].filter(Boolean).join(' ');
      const payload = { ...settings, address: combinedAddress || undefined };
      const updated = await updateAdminSettings(payload);
      setSettings(updated);
      setAddressDetail('');
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
            <AddressField
              address={settings.address ?? ''}
              addressDetail={addressDetail}
              onAddressChange={(v) => updateField('address', v)}
              onAddressDetailChange={setAddressDetail}
              error={addressError}
              addressDetailError={addressDetailError}
              showDetail={true}
              disabled={saving}
              id="address"
              detailId="addressDetail"
            />
          </div>
          <h4 className={styles.subSectionTitle}>사업자 정보</h4>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="businessRegistrationNumber">
              사업자등록번호
            </label>
            <input
              id="businessRegistrationNumber"
              type="text"
              className={styles.input}
              value={settings.businessRegistrationNumber ?? ''}
              onChange={(e) => updateField('businessRegistrationNumber', e.target.value)}
              placeholder="예: 123-45-67890"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="companyName">
              상호명
            </label>
            <input
              id="companyName"
              type="text"
              className={styles.input}
              value={settings.companyName ?? ''}
              onChange={(e) => updateField('companyName', e.target.value)}
              placeholder="예: (주)엔카페"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="representativeName">
              대표자명
            </label>
            <input
              id="representativeName"
              type="text"
              className={styles.input}
              value={settings.representativeName ?? ''}
              onChange={(e) => updateField('representativeName', e.target.value)}
              placeholder="예: 홍길동"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="businessType">
              업태
            </label>
            <input
              id="businessType"
              type="text"
              className={styles.input}
              value={settings.businessType ?? ''}
              onChange={(e) => updateField('businessType', e.target.value)}
              placeholder="예: 음식점업"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="businessItem">
              종목
            </label>
            <input
              id="businessItem"
              type="text"
              className={styles.input}
              value={settings.businessItem ?? ''}
              onChange={(e) => updateField('businessItem', e.target.value)}
              placeholder="예: 커피음료"
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
          <h3 className={styles.sectionTitle}>운영 (도메인별 활성/비활성)</h3>
          <p className={styles.hint}>
            <strong>체크 ON = 활성</strong> (해당 메뉴·기능이 사용자에게 노출됨), <strong>체크 OFF = 비활성</strong> (노출되지 않거나 제한됨).
            각 항목을 클릭해 켜고 끄기를 바꾼 뒤, 아래 &quot;설정 저장&quot; 버튼을 눌러야 반영됩니다.
          </p>
          <div className={styles.featureGrid}>
            <div className={styles.fieldRow}>
              <input
                id="featureMenu"
                type="checkbox"
                className={styles.checkbox}
                checked={(settings.featureMenu ?? 'true') === 'true'}
                onChange={(e) => updateField('featureMenu', e.target.checked ? 'true' : 'false')}
              />
              <label className={styles.checkboxLabel} htmlFor="featureMenu">
                메뉴
              </label>
            </div>
            <div className={styles.fieldRow}>
              <input
                id="featureOrder"
                type="checkbox"
                className={styles.checkbox}
                checked={(settings.featureOrder ?? 'true') === 'true'}
                onChange={(e) => updateField('featureOrder', e.target.checked ? 'true' : 'false')}
              />
              <label className={styles.checkboxLabel} htmlFor="featureOrder">
                주문
              </label>
            </div>
            <div className={styles.fieldRow}>
              <input
                id="featureNotice"
                type="checkbox"
                className={styles.checkbox}
                checked={(settings.featureNotice ?? 'true') === 'true'}
                onChange={(e) => updateField('featureNotice', e.target.checked ? 'true' : 'false')}
              />
              <label className={styles.checkboxLabel} htmlFor="featureNotice">
                공지사항
              </label>
            </div>
            <div className={styles.fieldRow}>
              <input
                id="featureInquiry"
                type="checkbox"
                className={styles.checkbox}
                checked={(settings.featureInquiry ?? 'true') === 'true'}
                onChange={(e) => updateField('featureInquiry', e.target.checked ? 'true' : 'false')}
              />
              <label className={styles.checkboxLabel} htmlFor="featureInquiry">
                1:1 문의
              </label>
            </div>
            <div className={styles.fieldRow}>
              <input
                id="featureMember"
                type="checkbox"
                className={styles.checkbox}
                checked={(settings.featureMember ?? 'true') === 'true'}
                onChange={(e) => updateField('featureMember', e.target.checked ? 'true' : 'false')}
              />
              <label className={styles.checkboxLabel} htmlFor="featureMember">
                회원 / 마이페이지
              </label>
            </div>
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
