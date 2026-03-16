'use client';

import { useDaumPostcode } from '@/hooks/useDaumPostcode';
import styles from './AddressField.module.css';

export interface AddressFieldProps {
  /** 주소 (도로명/지번 등) */
  address: string;
  /** 상세주소 (동, 호수 등) */
  addressDetail?: string;
  onAddressChange: (value: string) => void;
  onAddressDetailChange?: (value: string) => void;
  /** 주소 필드 에러 메시지 */
  error?: string | null;
  /** 상세주소 에러 메시지 */
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

  const handleSearch = () => {
    if (disabled) return;
    openAddressSearch((fullAddress) => onAddressChange(fullAddress));
  };

  return (
    <div className={`${styles.wrap} ${className}`}>
      <div className={styles.addressRow}>
        <input
          id={id}
          type="text"
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder={addressPlaceholder}
          disabled={disabled}
          required={required}
          autoComplete="street-address"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
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
      {error && (
        <span id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
      {showDetail && (
        <>
          <input
            id={detailId}
            type="text"
            className={`${styles.input} ${styles.detailInput} ${addressDetailError ? styles.inputError : ''}`}
            value={addressDetail}
            onChange={(e) => onAddressDetailChange?.(e.target.value)}
            placeholder={detailPlaceholder}
            disabled={disabled}
            autoComplete="address-line2"
            aria-invalid={!!addressDetailError}
          />
          {addressDetailError && (
            <span className={styles.error} role="alert">
              {addressDetailError}
            </span>
          )}
        </>
      )}
    </div>
  );
}
