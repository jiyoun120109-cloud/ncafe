import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

/**
 * GET /api/auth/session
 *
 * 쿠키에 저장된 JWT 기반 인증 상태: user 정보 반환 (JWT는 노출하지 않음).
 */
export async function GET() {
    const session = await getSession();

    if (!session.token || !session.user) {
        return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: session.user });
}
