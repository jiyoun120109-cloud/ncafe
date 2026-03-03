import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

/**
 * GET /api/auth/me
 *
 * 쿠키의 JWT 기반으로 저장된 사용자 정보 반환. (session과 동일한 값)
 */
export async function GET() {
    const session = await getSession();

    if (!session.token || !session.user) {
        return NextResponse.json(
            { success: false, message: '로그인이 필요합니다.' },
            { status: 401 }
        );
    }

    return NextResponse.json({
        success: true,
        message: '인증됨',
        member: session.user,
    });
}
