import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getBackendCsrfToken } from '@/lib/backendCsrf';

const API_BASE = process.env.API_BASE_URL || process.env.BACKEND_URL || 'http://localhost:8011';

/**
 * POST /api/auth/login
 *
 * BFF 인증: 세션 미사용. 백엔드에서 JWT 발급 → 쿠키에 JWT+user 암호화 저장.
 * CSRF 토큰을 조회한 뒤 POST 시 X-XSRF-TOKEN, Cookie로 전달.
 */
export async function POST(req: NextRequest) {
    const body = await req.json();

    const csrfToken = await getBackendCsrfToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken;
        headers['Cookie'] = `XSRF-TOKEN=${csrfToken}`;
    }

    const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    const data = await loginRes.json().catch(() => ({ success: false, message: '서버 오류' }));

    if (!loginRes.ok || !data.success) {
        return NextResponse.json(
            { success: false, message: data.message || '로그인에 실패했습니다.' },
            { status: loginRes.status || 401 }
        );
    }

    const token = data.accessToken ?? data.token;
    if (!token) {
        return NextResponse.json(
            { success: false, message: '토큰을 받지 못했습니다.' },
            { status: 500 }
        );
    }

    const member = data.member;
    const session = await getSession();
    session.token = token;
    session.user = {
        id: member.id,
        username: member.username,
        name: member.name ?? member.username,
        role: member.role,
    };
    await session.save();

    return NextResponse.json({ success: true, message: '로그인 성공', member: session.user });
}
