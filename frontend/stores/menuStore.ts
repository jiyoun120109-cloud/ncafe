import { create } from 'zustand';
import { Menu } from '@/types/menu';
import { mockMenus } from '@/mocks/menuData';

interface MenuState {
    menus: Menu[];
    setMenus: (menus: Menu[]) => void;
    addMenu: (menu: Menu) => void;
    updateMenu: (id: string, updatedMenu: Partial<Menu>) => void;
    deleteMenu: (id: string) => void;
    toggleSoldOut: (id: string) => void;
    reorderMenus: (category: string, reorderedMenus: Menu[]) => void;
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
            const otherMenus = state.menus.filter(m => m.category !== category || category === 'all');

            // 만약 'all' 카테고리라면 전체를 교체
            if (category === 'all') {
                return { menus: reorderedMenus };
            }

            // 특정 카테고리 내에서만 재정렬된 경우, 해당 카테고리 위치에 삽입하거나
            // 간단하게는 기존 배열에서 해당 카테고리 메뉴들만 교체
            const newMenus = [...state.menus];
            // 이 방식은 복잡해질 수 있으므로, 전체 리스트에서 해당 카테고리 아이템들을 
            // 정렬된 순서로 업데이트하는 방식 권장

            // 단순하게 구현: 전체 리스트 유지하면서 순서값 업데이트
            return { menus: [...otherMenus, ...reorderedMenus].sort((a, b) => a.sortOrder - b.sortOrder) };
            // 하지만 dnd-kit으로 받은 리스트가 최종 리스트라면 그냥 set하는게 편함
        }),
}));
