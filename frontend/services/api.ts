// API base configuration
// 서버사이드에서는 절대 URL, 클라이언트사이드에서는 상대 경로 사용 (Next.js rewrite 활용)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8011';
export const API_URL = `${API_BASE_URL}/api`;

/** 브라우저에서는 항상 같은 출처 /api 사용 (이미지 /images/ rewrite와 동일 origin) */
export const getApiBase = () => {
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/api`;
    }
    return API_URL;
};

export const fetcher = async (url: string, options?: RequestInit) => {
    const res = await fetch(`${getApiBase()}${url}`, options);
    if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    return res.json();
};
