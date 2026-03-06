import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getBackendCsrfToken, isStateChangingMethod } from '@/lib/backendCsrf';

const API_BASE = process.env.API_BASE_URL || process.env.BACKEND_URL || 'http://localhost:8011';

/**
 * Catch-all API 프록시
 *
 * BFF 인증: JWT를 Bearer로, CSRF 토큰을 X-XSRF-TOKEN + Cookie로 백엔드에 전달.
 */
async function proxyRequest(req: NextRequest) {
    const session = await getSession();
    const path = req.nextUrl.pathname;
    const search = req.nextUrl.search;
    const targetUrl = `${API_BASE}${path}${search}`;

    const headers: Record<string, string> = {};

    const contentType = req.headers.get('content-type');
    if (contentType) headers['Content-Type'] = contentType;

    const accept = req.headers.get('accept');
    if (accept) headers['Accept'] = accept;

    if (session.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
    }

    if (isStateChangingMethod(req.method)) {
        const csrfToken = await getBackendCsrfToken();
        if (csrfToken) {
            headers['X-XSRF-TOKEN'] = csrfToken;
            headers['Cookie'] = `XSRF-TOKEN=${csrfToken}`;
        }
    }

    let body: BodyInit | null = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        if (contentType?.includes('multipart/form-data')) {
            body = await req.blob();
        } else {
            body = await req.text();
        }
    }

    const proxyRes = await fetch(targetUrl, {
        method: req.method,
        headers,
        body,
    });

    // 백엔드 401(JWT 만료 등) 시 세션 제거 → 클라이언트가 다시 로그인하도록
    if (proxyRes.status === 401 && session.token) {
        try {
            await session.destroy();
        } catch {
            // 세션 정리 실패해도 프록시 응답은 그대로 전달
        }
    }

    const responseHeaders = new Headers();
    const resContentType = proxyRes.headers.get('content-type');
    if (resContentType) responseHeaders.set('Content-Type', resContentType);

    return new NextResponse(proxyRes.body, {
        status: proxyRes.status,
        statusText: proxyRes.statusText,
        headers: responseHeaders,
    });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
