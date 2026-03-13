import { AuthUser } from '@/stores/authStore';
import { authAPI } from '@/lib/api';

/**
 * 로그인
 * POST /api/auth/login → Next.js BFF → Spring Boot
 */
export async function loginApi(username: string, password: string): Promise<AuthUser> {
    const data = await authAPI.login(username, password) as {
        success: boolean;
        message: string;
        member: { id: number; username: string; name: string | null; role: string };
    };

    if (!data?.member) {
        throw new Error('로그인에 실패했습니다.');
    }

    return {
        id: String(data.member.id),
        username: data.member.username,
        name: data.member.name,
        role: data.member.role,
    };
}

/**
 * 로그아웃
 * POST /api/auth/logout → BFF 쿠키(JWT+user) 삭제
 */
export async function logoutApi(): Promise<void> {
    await authAPI.logout();
}

export interface SignupParams {
    username: string;
    password: string;
    name?: string;
    birthDate?: string;
    phone?: string;
    displayNickname?: string;
    email?: string;
}

/**
 * 아이디 사용 가능 여부 확인
 * GET /api/auth/check-username?username=xxx
 */
export async function checkUsernameApi(username: string): Promise<boolean> {
    const data = await authAPI.checkUsername(username);
    return !!data?.available;
}

/**
 * 회원가입
 * POST /api/auth/signup → Next.js BFF → Spring Boot
 */
export async function signupApi(params: SignupParams): Promise<{ success: boolean; message: string }> {
    const data = await authAPI.signup(params);
    return { success: !!data?.success, message: data?.message ?? '' };
}

/**
 * 현재 로그인 사용자 조회
 * GET /api/auth/session → BFF 쿠키(JWT) 기반 user 반환
 */
export async function getMeApi(): Promise<AuthUser | null> {
    try {
        const data = await authAPI.getSession();
        if (!data?.user) return null;

        return {
            id: String(data.user.id),
            username: data.user.username,
            name: data.user.name,
            role: data.user.role,
        };
    } catch {
        return null;
    }
}
