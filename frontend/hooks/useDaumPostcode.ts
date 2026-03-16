'use client';

import { useCallback } from 'react';

export type DaumPostcodeData = {
  userSelectedType: string;
  roadAddress: string;
  jibunAddress: string;
  buildingName?: string;
};

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: { oncomplete: (data: DaumPostcodeData) => void }) => { open: () => void };
    };
  }
}

const SCRIPT_URL = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('window undefined'));
  if (window.daum?.Postcode) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_URL}"]`);
    if (existing) {
      const check = () => (window.daum?.Postcode ? resolve() : setTimeout(check, 50));
      check();
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('주소 검색 스크립트를 불러올 수 없습니다.'));
    document.body.appendChild(script);
  });
}

/**
 * Daum 우편번호 검색을 열고, 선택 시 반환된 주소(도로명/지번 + 건물명)를 한 문자열로 만들어 onSelect에 전달.
 */
export function useDaumPostcode() {
  const openAddressSearch = useCallback((onSelect: (fullAddress: string) => void) => {
    const onComplete = (data: DaumPostcodeData) => {
      let full = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
      if (data.buildingName) full += ` ${data.buildingName}`;
      onSelect(full.trim());
    };
    loadScript()
      .then(() => {
        if (window.daum?.Postcode) {
          new window.daum.Postcode({ oncomplete: onComplete }).open();
        }
      })
      .catch(() => {
        alert('주소 검색을 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.');
      });
  }, []);
  return { openAddressSearch };
}
