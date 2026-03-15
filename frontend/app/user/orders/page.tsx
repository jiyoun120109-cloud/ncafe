'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

/**
 * 주문 내역 목록은 마이페이지 주문 탭으로 통합.
 * /user/orders → /user?tab=orders 리다이렉트
 */
export default function UserOrdersRedirectPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?returnUrl=${encodeURIComponent('/user?tab=orders')}`);
      return;
    }
    router.replace('/user?tab=orders');
  }, [isAuthenticated, router]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(0,0,0,0.6)' }}>
      주문 내역으로 이동 중...
    </div>
  );
}
