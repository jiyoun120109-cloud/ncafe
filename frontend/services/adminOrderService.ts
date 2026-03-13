import { getApiBase } from '@/services/api';

export interface AdminOrderListItem {
  id: number;
  userId: number | null;
  guestEmail: string | null;
  guestPhone: string | null;
  status: string;
  totalAmount: number;
  createdAt: string;
  itemCount: number;
}

export interface AdminOrderListResponse {
  content: AdminOrderListItem[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export interface AdminOrderItemDto {
  id: number;
  menuId: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
  optionExtraPrice: number;
  optionsDisplay: string | null;
}

export interface AdminOrderDetailDto {
  id: number;
  userId: number | null;
  guestEmail: string | null;
  guestPhone: string | null;
  status: string;
  totalAmount: number;
  appliedUserCouponId: number | null;
  createdAt: string;
  updatedAt: string | null;
  items: AdminOrderItemDto[];
}

export interface AdminOrderStats {
  ordersToday: number;
  revenueToday: number;
  ordersYesterday: number;
  revenueYesterday: number;
  pendingCount: number;
  paidCount: number;
  cancelledCount: number;
}

export type StatsPeriod = 'day' | 'week' | 'month';

export interface AdminOrderStatsPeriodPoint {
  label: string;
  orderCount: number;
  revenue: number;
  visitorCount: number;
}

export async function fetchAdminOrderStatsPeriod(period: StatsPeriod): Promise<AdminOrderStatsPeriodPoint[]> {
  const res = await fetch(`${getApiBase()}/admin/orders/stats/period?period=${period}`, { credentials: 'include' });
  if (!res.ok) throw new Error('기간별 통계를 불러올 수 없습니다.');
  return res.json();
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: '결제대기',
  PAID: '결제완료',
  PREPARING: '준비중',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

export function getOrderStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export async function fetchAdminOrders(
  page: number = 0,
  size: number = 10,
  options?: { status?: string; fromDate?: string; toDate?: string }
): Promise<AdminOrderListResponse> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (options?.status?.trim()) params.set('status', options.status.trim());
  if (options?.fromDate) params.set('fromDate', options.fromDate);
  if (options?.toDate) params.set('toDate', options.toDate);
  const res = await fetch(`${getApiBase()}/admin/orders?${params}`, { credentials: 'include' });
  if (!res.ok) throw new Error('주문 목록을 불러올 수 없습니다.');
  return res.json();
}

export async function fetchAdminOrder(id: number): Promise<AdminOrderDetailDto> {
  const res = await fetch(`${getApiBase()}/admin/orders/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('주문을 불러올 수 없습니다.');
  return res.json();
}

export async function fetchAdminOrderStats(date?: string): Promise<AdminOrderStats> {
  const params = date ? `?date=${date}` : '';
  const res = await fetch(`${getApiBase()}/admin/orders/stats${params}`, { credentials: 'include' });
  if (!res.ok) throw new Error('통계를 불러올 수 없습니다.');
  return res.json();
}

export async function updateAdminOrderStatus(orderId: number, status: string): Promise<AdminOrderDetailDto> {
  const res = await fetch(`${getApiBase()}/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? '상태 변경에 실패했습니다.');
  }
  return res.json();
}

export async function cancelAdminOrder(orderId: number): Promise<AdminOrderDetailDto> {
  const res = await fetch(`${getApiBase()}/admin/orders/${orderId}/cancel`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? '취소에 실패했습니다.');
  }
  return res.json();
}
