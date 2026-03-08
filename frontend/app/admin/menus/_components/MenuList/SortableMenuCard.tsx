'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MenuCard from '../MenuCard';
import { MenuResponse } from './useMenus';
import listStyles from './MenuList.module.css';

interface SortableMenuCardProps {
    menu: MenuResponse;
    onUpdated?: () => void;
}

export default function SortableMenuCard({ menu, onUpdated }: SortableMenuCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: menu.id, data: { menu } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${listStyles.sortableItem} ${isDragging ? listStyles.sortableItemDragging : ''}`}
        >
            <MenuCard
                menu={menu}
                onUpdated={onUpdated}
                dragHandleProps={{
                    listeners: listeners as Record<string, unknown> | undefined,
                    attributes: attributes as unknown as Record<string, unknown>,
                }}
            />
        </div>
    );
}
