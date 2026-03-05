import { getSession } from '@/lib/session';

const API_BASE = process.env.API_BASE_URL || process.env.BACKEND_URL || 'http://localhost:8011';

/**
 * 백엔드 CSRF 토큰 조회. 세션에 없으면 GET /api/csrf 호출 후 저장.
 */
export async function getBackendCsrfToken(): Promise<string> {
    const session = await getSession();
    if (session.csrfToken) {
        return session.csrfToken;
    }
    const res = await fetch(`${API_BASE}/api/csrf`, { method: 'GET' });
    const data = (await res.json().catch(() => ({}))) as { token?: string };
    const token = data?.token ?? '';
    if (token) {
        session.csrfToken = token;
        await session.save();
    }
    return token;
}

/**
 * state-changing 메서드인지 여부
 */
export function isStateChangingMethod(method: string): boolean {
    return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());
}
