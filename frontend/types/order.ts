export interface Order {
    id: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderItem {
    id: string;
    menuId: string;
    quantity: number;
    price: number;
    options: any[];
}
