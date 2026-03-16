'use client';

import { useState, useCallback } from 'react';
import { useDaumPostcode } from '@/hooks/useDaumPostcode';
import { validateAddress, validateAddressDetail } from '@/lib/addressValidation';
import styles from './AddressField.module.css';

export interface AddressFieldProps {
  /** 주소 (도로명/지번 등) */
  address: string;
  /** 상세주소 (동, 호수 등) */
  addressDetail?: string;
  onAddressChange: (value: string) => void;
  onAddressDetailChange?: (value: string) => void;
  /** 부모가 직접 전달하는 에러 (폼 제출 시 등) — 내부 검사보다 우선 */
  error?: string | null;
  /** 부모가 직접 전달하는 상세주소 에러 */
  addressDetailError?: string | null;
  /** 상세주소 입력란 표시 여부 */
  showDetail?: boolean;
  required?: boolean;
  disabled?: boolean;
  addressPlaceholder?: string;
  detailPlaceholder?: string;
  searchButtonLabel?: string;
  id?: string;
  detailId?: string;
  className?: string;
}

export default function AddressField({
  address,
  addressDetail = '',
  onAddressChange,
  onAddressDetailChange,
  error,
  addressDetailError,
  showDetail = true,
  required = false,
  disabled = false,
  addressPlaceholder = '주소 검색 버튼으로 검색 후 선택하면 여기에 입력됩니다',
  detailPlaceholder = '상세주소 (동, 호수 등)',
  searchButtonLabel = '주소 검색',
  id = 'address',
  detailId = 'addressDetail',
  className = '',
}: AddressFieldProps) {
  const { openAddressSearch } = useDaumPostcode();
  const [localAddrError, setLocalAddrError] = useState<string | null>(null);
  const [localDetailError, setLocalDetailError] = useState<string | null>(null);

  const addrError = error || localAddrError;
  const detailError = addressDetailError || localDetailError;

  const handleSearch = () => {
    if (disabled) return;
    openAddressSearch((fullAddress) => {
      onAddressChange(fullAddress);
      setLocalAddrError(null);
    });
  };

  const handleAddrChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onAddressChange(e.target.value);
    if (localAddrError) setLocalAddrError(null);
  }, [onAddressChange, localAddrError]);

  const handleAddrBlur = useCallback(() => {
    setLocalAddrError(validateAddress(address, { required }));
  }, [address, required]);

  const handleDetailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onAddressDetailChange?.(e.target.value);
    if (localDetailError) setLocalDetailError(null);
  }, [onAddressDetailChange, localDetailError]);

  const handleDetailBlur = useCallback(() => {
    setLocalDetailError(validateAddressDetail(addressDetail));
  }, [addressDetail]);

  return (
    <div className={`${styles.wrap} ${className}`}>
      <div className={styles.addressRow}>
        <input
          id={id}
          type="text"
          className={`${styles.input} ${addrError ? styles.inputError : ''}`}
          value={address}
          onChange={handleAddrChange}
          onBlur={handleAddrBlur}
          placeholder={addressPlaceholder}
          disabled={disabled}
          required={required}
          autoComplete="street-address"
          aria-invalid={!!addrError}
          aria-describedby={addrError ? `${id}-error` : undefined}
        />
        <button
          type="button"
          className={styles.searchBtn}
          onClick={handleSearch}
          disabled={disabled}
          aria-label={searchButtonLabel}
        >
          {searchButtonLabel}
        </button>
      </div>
      {addrError && (
        <span id={`${id}-error`} className={styles.error} role="alert">
          {addrError}
        </span>
      )}
      {showDetail && (
        <>
          <input
            id={detailId}
            type="text"
            className={`${styles.input} ${styles.detailInput} ${detailError ? styles.inputError : ''}`}
            value={addressDetail}
            onChange={handleDetailChange}
            onBlur={handleDetailBlur}
            placeholder={detailPlaceholder}
            disabled={disabled}
            autoComplete="address-line2"
            aria-invalid={!!detailError}
          />
          {detailError && (
            <span className={styles.error} role="alert">
              {detailError}
            </span>
          )}
        </>
      )}
    </div>
  );
}
