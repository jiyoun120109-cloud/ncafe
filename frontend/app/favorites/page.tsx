'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** 찜 페이지는 마이페이지 탭으로 통합. /favorites 접근 시 /user?tab=favorites로 리다이렉트 */
export default function FavoritesRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/user?tab=favorites');
  }, [router]);
  return null;
}
