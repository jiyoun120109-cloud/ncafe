'use client';

import { usePathname } from 'next/navigation';
import GuestChat from './GuestChat';

/** 손님 페이지(비관리자)에서만 채팅 위젯 노출 */
export default function ChatWidget() {
  const pathname = usePathname();
  const isGuest = !pathname?.startsWith('/admin');
  if (!isGuest) return null;
  return <GuestChat />;
}
