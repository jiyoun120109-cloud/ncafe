import { getIronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

// ──────────────────────────────────────
// BFF 인증: 세션 없이 JWT + 쿠키. 쿠키에 JWT와 user만 암호화 저장.
// ──────────────────────────────────────
export interface SessionUser {
    id: number;
    username: string;
    name: string | null;
    role: string;
}

export interface SessionData {
    /** 백엔드에서 발급한 JWT (API 호출 시 Authorization Bearer로 전달) */
    token?: string;
    user?: SessionUser;
    /** 백엔드 CSRF 토큰 (POST/PUT/DELETE 시 X-XSRF-TOKEN, Cookie로 전달) */
    csrfToken?: string;
}

export const sessionOptions: SessionOptions = {
    password: process.env.SESSION_SECRET || 'ncafe-bff-session-secret-key-2026-change-in-prod',
    cookieName: 'app_session',
    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 60 * 60 * 24, // JWT 유효기간과 동일 (24시간)
    },
};

export async function getSession() {
    const cookieStore = await cookies();
    return getIronSession<SessionData>(cookieStore, sessionOptions);
}
