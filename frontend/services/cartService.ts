import { getApiBase } from '@/services/api';

const CART_SESSION_KEY = 'ncafe_cart_session_id';

function getCartSessionId(): string {
    if (typeof window === 'undefined') return '';
    let id = localStorage.getItem(CART_SESSION_KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(CART_SESSION_KEY, id);
    }
    return id;
}

export interface CartItemOptions {
    temperature?: 'HOT' | 'ICED';
    beanOption?: string;
    decaf?: boolean;
}

export interface CartItemDto {
    id: number;
    menuId: number;
    menuKorName: string;
    menuPrice: number;
    quantity: number;
    optionsDisplay?: string | null;
    optionExtraPrice?: number;
    menuImageUrl?: string | null;
    temperature?: string | null;
    beanOption?: string | null;
    decaf?: boolean | null;
}

export interface CartResponse {
    cartId: number | null;
    items: CartItemDto[];
    totalQuantity: number;
}

function cartHeaders(): HeadersInit {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'x-cart-session-id': getCartSessionId(),
    };
    return headers;
}

export async function fetchCart(): Promise<CartResponse> {
    const res = await fetch(`${getApiBase()}/cart`, {
        credentials: 'same-origin',
        headers: cartHeaders(),
    });
    if (!res.ok) throw new Error('장바구니 조회 실패');
    return res.json();
}

export async function addCartItem(
    menuId: number,
    quantity: number = 1,
    options?: CartItemOptions
): Promise<void> {
    const body: { menuId: number; quantity: number; temperature?: string; beanOption?: string; decaf?: boolean } = {
        menuId,
        quantity,
    };
    if (options?.temperature) body.temperature = options.temperature;
    if (options?.beanOption) body.beanOption = options.beanOption;
    if (options?.decaf != null) body.decaf = options.decaf;
    const res = await fetch(`${getApiBase()}/cart/items`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: cartHeaders(),
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('장바구니 담기 실패');
}

export async function updateCartItemQuantity(cartItemId: number, quantity: number): Promise<void> {
    const res = await fetch(`${getApiBase()}/cart/items/${cartItemId}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: cartHeaders(),
        body: JSON.stringify({ quantity }),
    });
    if (!res.ok) throw new Error('수량 변경 실패');
}

export async function updateCartItemOptions(
    cartItemId: number,
    options: CartItemOptions
): Promise<void> {
    const body: { temperature?: string; beanOption?: string; decaf?: boolean } = {};
    if (options.temperature) body.temperature = options.temperature;
    if (options.beanOption !== undefined) body.beanOption = options.beanOption;
    if (options.decaf != null) body.decaf = options.decaf;
    const res = await fetch(`${getApiBase()}/cart/items/${cartItemId}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: cartHeaders(),
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('옵션 변경 실패');
}

export async function removeCartItem(cartItemId: number): Promise<void> {
    const res = await fetch(`${getApiBase()}/cart/items/${cartItemId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: cartHeaders(),
    });
    if (!res.ok) throw new Error('삭제 실패');
}

export { getCartSessionId };
