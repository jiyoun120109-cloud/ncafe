/**
 * 클라이언트 fetchAPI 유틸리티
 *
 * - JWT를 수동으로 넣을 필요 없음 (Catch-all 프록시가 자동 처리)
 * - localStorage 관련 코드 없음
 * - 401 에러 시 자동으로 /login 리다이렉트
 */
export async function fetchAPI<T = unknown>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`/api${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options?.headers,
        },
        // credentials: 'same-origin' 이 기본값 → 쿠키 자동 전송
    });

    if (!res.ok) {
        if (res.status === 401 && typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
            return undefined as T;
        }

        const error = new Error(`API Error: ${res.status}`) as Error & { status: number };
        error.status = res.status;
        try {
            const body = await res.json();
            error.message = body.message || error.message;
        } catch { /* no json body */ }
        throw error;
    }

    const contentType = res.headers.get('content-type');
    if (contentType?.includes('application/json')) {
        return res.json() as Promise<T>;
    }
    return null as T;
}

// ──────────────────────────────────────
// 인증 API
// ──────────────────────────────────────
export const authAPI = {
    login: (username: string, password: string) =>
        fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        }),

    logout: () =>
        fetchAPI('/auth/logout', { method: 'POST' }),

    getSession: () =>
        fetchAPI<{ user: { id: number; username: string; name: string | null; role: string } | null }>('/auth/session'),
};
