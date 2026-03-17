import { create } from 'zustand';

export interface AuthUser {
    id: string;
    username: string;
    name: string | null;
    role: string;
}

interface AuthState {
    user: AuthUser | null;
    /** 헤더 등에서 표시할 프로필 이미지 URL (상대 경로). 프로필 조회/업로드 시 갱신 */
    profileImageUrl: string | null;
    isAuthenticated: boolean;
    /** 세션 확인(getMeApi) 완료 여부. false면 아직 확인 전이므로 리다이렉트/로딩 판단 보류 */
    sessionChecked: boolean;
    isLoading: boolean;

    setUser: (user: AuthUser) => void;
    setProfileImageUrl: (url: string | null) => void;
    clearUser: () => void;
    setSessionChecked: (checked: boolean) => void;
    setLoading: (loading: boolean) => void;
}

/**
 * 클라이언트 인증 상태 스토어
 *
 * localStorage에 저장하지 않습니다.
 * 실제 인증 여부는 BFF 쿠키(JWT) 기반 /api/auth/session 으로 확인합니다.
 * 이 스토어는 UI 표시(이름, 역할 등)에만 사용합니다.
 */
export const useAuthStore = create<AuthState>()((set) => ({
    user: null,
    profileImageUrl: null,
    isAuthenticated: false,
    sessionChecked: false,
    isLoading: false,

    setUser: (user) => set({ user, isAuthenticated: true, sessionChecked: true }),
    setProfileImageUrl: (url) => set({ profileImageUrl: url }),
    clearUser: () => set({ user: null, profileImageUrl: null, isAuthenticated: false, sessionChecked: true }),
    setSessionChecked: (checked) => set({ sessionChecked: checked }),
    setLoading: (loading) => set({ isLoading: loading }),
}));
