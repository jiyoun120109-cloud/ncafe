/**
 * 주소 필드 유효성 검사
 * - required일 때 빈 값/공백만 있으면 에러
 * - 길이 초과 시 에러
 * - 공백·특수문자만 있으면 에러
 */
export function validateAddress(value: string | null | undefined, options?: { required?: boolean; maxLength?: number }): string | null {
  const { required = false, maxLength = 300 } = options ?? {};
  const trimmed = (value ?? '').trim();
  if (required && trimmed.length === 0) return '주소를 입력하세요.';
  if (trimmed.length > maxLength) return `주소는 ${maxLength}자 이내로 입력하세요.`;
  if (trimmed.length > 0 && !/[가-힣a-zA-Z0-9\s\-.,()]/.test(trimmed)) return '올바른 주소를 입력하세요.';
  return null;
}

export function validateAddressDetail(value: string | null | undefined, options?: { maxLength?: number }): string | null {
  const { maxLength = 100 } = options ?? {};
  const trimmed = (value ?? '').trim();
  if (trimmed.length > maxLength) return `상세주소는 ${maxLength}자 이내로 입력하세요.`;
  return null;
}
