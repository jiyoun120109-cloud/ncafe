import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getBackendCsrfToken } from '@/lib/backendCsrf';

const API_BASE = process.env.BACKEND_URL || 'http://localhost:8011';

/**
 * POST /api/auth/logout
 *
 * 서버 세션 없음. BFF 쿠키(JWT+user)만 삭제. 백엔드 /logout 호출 시 CSRF 전달.
 */
export async function POST() {
    const csrfToken = await getBackendCsrfToken();
    const headers: Record<string, string> = {};
    if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken;
        headers['Cookie'] = `XSRF-TOKEN=${csrfToken}`;
    }
    await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', headers }).catch(() => null);

    const session = await getSession();
    session.destroy();

    return NextResponse.json({ success: true, message: '로그아웃 성공', member: null });
}
