import { useMenuStore } from '@/stores/menuStore';
import { Menu } from '@/types/menu';

export const useMenu = () => {
    const { menus, addMenu, updateMenu, deleteMenu, toggleSoldOut } = useMenuStore();

    return {
        menus,
        addMenu,
        updateMenu,
        deleteMenu,
        toggleSoldOut,
    };
};
