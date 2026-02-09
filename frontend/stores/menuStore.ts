import { create } from 'zustand';
import { Menu } from '@/types/menu';
import { mockMenus } from '@/mocks/menuData';

interface MenuState {
    menus: Menu[];
    setMenus: (menus: Menu[]) => void;
    addMenu: (menu: Menu) => void;
    updateMenu: (id: number, updatedMenu: Partial<Menu>) => void;
    deleteMenu: (id: number) => void;
    toggleSoldOut: (id: number) => void;
    reorderMenus: (category: number | 'all', reorderedMenus: Menu[]) => void;
}

export const useMenuStore = create<MenuState>((set) => ({
    menus: mockMenus,
    setMenus: (menus) => set({ menus }),
    addMenu: (menu) => set((state) => ({ menus: [menu, ...state.menus] })),
    updateMenu: (id, updatedMenu) =>
        set((state) => ({
            menus: state.menus.map((menu) =>
                menu.id === id ? { ...menu, ...updatedMenu, updatedAt: new Date() } : menu
            ),
        })),
    deleteMenu: (id) =>
        set((state) => ({
            menus: state.menus.filter((menu) => menu.id !== id),
        })),
    toggleSoldOut: (id) =>
        set((state) => ({
            menus: state.menus.map((menu) =>
                menu.id === id ? { ...menu, isSoldOut: !menu.isSoldOut, updatedAt: new Date() } : menu
            ),
        })),
    reorderMenus: (category, reorderedMenus) =>
        set((state) => {
            // 해당 카테고리가 아닌 메뉴들
            // 해당 카테고리가 아닌 메뉴들
            const otherMenus = category === 'all' ? [] : state.menus.filter(m => m.category !== category);

            // 만약 'all' 카테고리라면 전체를 교체
            if (category === 'all') {
                return { menus: reorderedMenus };
            }

            // 단순하게 구현: 전체 리스트 유지하면서 순서값 업데이트
            return { menus: [...otherMenus, ...reorderedMenus].sort((a, b) => a.sortOrder - b.sortOrder) };
        }),
}));
