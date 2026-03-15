import { getApiBase } from '@/services/api';

export interface OrderItemInput {
  menuId: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
  optionExtraPrice?: number;
  optionsDisplay?: string | null;
}

export interface CreateOrderPayload {
  userId?: number | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  items: OrderItemInput[];
}

export interface CreateOrderResult {
  orderId: number;
  totalAmount: number;
  status: string;
}

export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult> {
  const res = await fetch(`${getApiBase()}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let message = '주문 생성에 실패했습니다.';
    try {
      const body = await res.json();
      if (body?.message && typeof body.message === 'string') message = body.message;
    } catch {
      /* 응답이 JSON이 아니면 기본 메시지 유지 */
    }
    throw new Error(message);
  }
  return res.json();
}

export async function getMyOrders(): Promise<OrderDto[]> {
  const res = await fetch(`${getApiBase()}/orders/my`, { credentials: 'include' });
  if (res.status === 401) throw new Error('로그인이 필요합니다.');
  if (!res.ok) throw new Error('주문 목록을 불러올 수 없습니다.');
  return res.json();
}

export interface OrderDto {
  id: number;
  userId?: number | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  status: string;
  totalAmount: number;
  appliedUserCouponId?: number | null;
  createdAt: string;
  items: { id: number; menuId: number; menuName: string; quantity: number; unitPrice: number; optionExtraPrice?: number; optionsDisplay?: string }[];
}

export async function getOrder(orderId: number): Promise<OrderDto> {
  const res = await fetch(`${getApiBase()}/orders/${orderId}`, { credentials: 'include' });
  if (!res.ok) throw new Error('주문 정보를 불러올 수 없습니다.');
  return res.json();
}

export async function paymentReady(orderId: number, method: string = 'KAKAOPAY'): Promise<{ redirectUrl: string; amount: number }> {
  const res = await fetch(`${getApiBase()}/orders/${orderId}/payments/ready`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ method }),
  });
  if (!res.ok) throw new Error('결제 준비에 실패했습니다.');
  const data = await res.json();
  return { redirectUrl: data.redirectUrl ?? '#', amount: data.amount ?? 0 };
}

export async function paymentComplete(orderId: number, pgTid?: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/orders/${orderId}/payments/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ pgTid: pgTid ?? '' }),
  });
  if (!res.ok) throw new Error('결제 완료 처리에 실패했습니다.');
}

export async function applyCouponToOrder(orderId: number, userCouponId: number): Promise<OrderDto> {
  const res = await fetch(`${getApiBase()}/orders/${orderId}/apply-coupon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userCouponId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? '쿠폰 적용에 실패했습니다.');
  }
  return res.json();
}
