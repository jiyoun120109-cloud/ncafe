// API base configuration — 클라이언트/서버 모두 BFF(/api) 경유, 백엔드 직접 요청 금지
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8011';
export const API_URL = `${API_BASE_URL}/api`;

/**
 * API 베이스 URL. 항상 BFF 경유.
 * - 브라우저: 같은 출처 /api (window.location.origin + '/api')
 * - 서버(SSR 등): 앱 자신의 URL + /api (NEXT_PUBLIC_APP_URL 우선). 백엔드 직접 호출 방지.
 */
export const getApiBase = () => {
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/api`;
    }
    const appOrigin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return `${appOrigin.replace(/\/$/, '')}/api`;
};

export const fetcher = async (url: string, options?: RequestInit) => {
    const res = await fetch(`${getApiBase()}${url}`, options);
    if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    return res.json();
};
