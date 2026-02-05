import { create } from 'zustand';

interface AuthState {
    user: any | null;
    isAuthenticated: boolean;
    login: (userData: any) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    login: (userData) => set({ user: userData, isAuthenticated: true }),
    logout: () => set({ user: null, isAuthenticated: false }),
}));
