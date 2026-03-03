import { NextRequest, NextResponse } from 'next/server';

// 로그인이 필요한 경로
const PROTECTED_PATHS = ['/admin'];

// 인증 체크를 건너뛸 경로
const PUBLIC_PATHS = ['/login', '/menus', '/api', '/_next', '/images'];

// BFF: 쿠키에는 JWT+user 암호화 저장 (세션 없음). cookieName은 session.ts와 동일.
const SESSION_COOKIE_NAME = 'app_session';

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 공개 경로 또는 정적 파일은 건너뜀
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }
    if (pathname.includes('.')) {
        return NextResponse.next();
    }

    // 보호 경로인지 확인
    const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
    if (!isProtected) {
        return NextResponse.next();
    }

    // 세션 쿠키 존재 여부 확인
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);
    if (!sessionCookie) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
