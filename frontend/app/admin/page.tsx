'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts';
import { X } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import {
    fetchAdminOrderStats,
    fetchAdminOrderStatsPeriod,
    fetchAdminOrders,
    fetchTodayRevenueBreakdown,
    getOrderStatusLabel,
    type AdminOrderStats,
    type AdminOrderStatsPeriodPoint,
    type AdminOrderListItem,
    type TodayRevenueBreakdown,
    type StatsPeriod,
} from '@/services/adminOrderService';
import styles from './page.module.css';

const PERIODS: { key: StatsPeriod; label: string }[] = [
    { key: 'day', label: '일간' },
    { key: 'week', label: '주간' },
    { key: 'month', label: '월간' },
];

type DetailType = 'orders_today' | 'revenue_today' | 'pending_paid' | 'visitors' | 'period' | null;

function todayISO(): string {
    const d = new Date();
    return d.toISOString().slice(0, 10);
}

export default function AdminDashboardPage() {
    const { setTitle } = useUIStore();
    const [stats, setStats] = useState<AdminOrderStats | null>(null);
    const [periodStats, setPeriodStats] = useState<AdminOrderStatsPeriodPoint[]>([]);
    const [period, setPeriod] = useState<StatsPeriod>('day');
    const [statsError, setStatsError] = useState<string | null>(null);
    const [periodError, setPeriodError] = useState<string | null>(null);

    const [selectedDetail, setSelectedDetail] = useState<DetailType>(null);
    const [detailOrders, setDetailOrders] = useState<AdminOrderListItem[]>([]);
    const [detailOrdersPending, setDetailOrdersPending] = useState<AdminOrderListItem[]>([]);
    const [detailOrdersPaid, setDetailOrdersPaid] = useState<AdminOrderListItem[]>([]);
    const [todayRevenueBreakdown, setTodayRevenueBreakdown] = useState<TodayRevenueBreakdown | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);

    useEffect(() => { setTitle('Dashboard'); }, [setTitle]);

    useEffect(() => {
        fetchAdminOrderStats()
            .then(setStats)
            .catch(() => setStatsError('통계를 불러올 수 없습니다.'));
    }, []);

    const loadPeriodStats = useCallback((p: StatsPeriod) => {
        setPeriodError(null);
        fetchAdminOrderStatsPeriod(p)
            .then(setPeriodStats)
            .catch(() => setPeriodError('기간별 통계를 불러올 수 없습니다.'));
    }, []);

    useEffect(() => {
        loadPeriodStats(period);
    }, [period, loadPeriodStats]);

    const loadDetailOrders = useCallback((type: 'orders_today') => {
        setDetailError(null);
        setDetailLoading(true);
        const today = todayISO();
        fetchAdminOrders(0, 100, { fromDate: today, toDate: today })
            .then((res) => setDetailOrders(res.content ?? []))
            .catch(() => setDetailError('목록을 불러올 수 없습니다.'))
            .finally(() => setDetailLoading(false));
    }, []);

    const loadPendingAndPaid = useCallback(() => {
        setDetailError(null);
        setDetailLoading(true);
        Promise.all([
            fetchAdminOrders(0, 100, { status: 'PENDING' }),
            fetchAdminOrders(0, 100, { status: 'PAID' }),
        ])
            .then(([pendingRes, paidRes]) => {
                setDetailOrdersPending(pendingRes.content ?? []);
                setDetailOrdersPaid(paidRes.content ?? []);
            })
            .catch(() => setDetailError('목록을 불러올 수 없습니다.'))
            .finally(() => setDetailLoading(false));
    }, []);

    const loadTodayRevenueBreakdown = useCallback(() => {
        setDetailError(null);
        setDetailLoading(true);
        setTodayRevenueBreakdown(null);
        fetchTodayRevenueBreakdown()
            .then(setTodayRevenueBreakdown)
            .catch(() => setDetailError('오늘 매출 상세를 불러올 수 없습니다.'))
            .finally(() => setDetailLoading(false));
    }, []);

    const handleStatClick = (detail: DetailType) => {
        setSelectedDetail(detail);
        if (detail === 'revenue_today') {
            loadTodayRevenueBreakdown();
        } else if (detail === 'orders_today') {
            loadDetailOrders('orders_today');
        } else if (detail === 'pending_paid') {
            loadPendingAndPaid();
        }
    };

    const ordersToday = stats?.ordersToday ?? 0;
    const ordersYesterday = stats?.ordersYesterday ?? 0;
    const revenueToday = stats?.revenueToday ?? 0;
    const revenueYesterday = stats?.revenueYesterday ?? 0;
    const pendingCount = stats?.pendingCount ?? 0;
    const paidCount = stats?.paidCount ?? 0;

    const orderDiff = ordersYesterday > 0 ? ordersToday - ordersYesterday : 0;
    const orderDiffText = orderDiff >= 0 ? `어제보다 +${orderDiff}건` : `어제보다 ${orderDiff}건`;
    const revenueDiff = revenueYesterday > 0 ? Math.round(((revenueToday - revenueYesterday) / revenueYesterday) * 100) : 0;
    const revenueDiffText = revenueDiff >= 0 ? `어제보다 +${revenueDiff}%` : `어제보다 ${revenueDiff}%`;

    const periodTotalOrders = periodStats.reduce((s, p) => s + (p.orderCount ?? 0), 0);
    const periodTotalRevenue = periodStats.reduce((s, p) => s + (p.revenue ?? 0), 0);
    const periodTotalVisitors = periodStats.reduce((s, p) => s + (p.visitorCount ?? 0), 0);

    const statCards: { label: string; value: string; sub: string; alert?: boolean; detail: DetailType }[] = [
        { label: '오늘 주문', value: String(ordersToday), sub: orderDiffText, detail: 'orders_today' },
        { label: '오늘 매출', value: `₩${revenueToday.toLocaleString()}`, sub: revenueDiffText, detail: 'revenue_today' },
        { label: '결제대기/결제완료', value: `${pendingCount}/${paidCount}`, sub: '주문 관리에서 확인', alert: pendingCount > 0, detail: 'pending_paid' },
        { label: '방문자 수', value: periodTotalVisitors.toLocaleString(), sub: `선택 기간 합계 (${PERIODS.find((x) => x.key === period)?.label})`, detail: 'visitors' },
    ];

    const chartData = periodStats.map((p) => ({
        name: p.label,
        주문: p.orderCount ?? 0,
        매출: p.revenue ?? 0,
        방문자: p.visitorCount ?? 0,
    }));

    const detailTitle =
        selectedDetail === 'orders_today'
            ? '오늘 주문 상세'
            : selectedDetail === 'revenue_today'
              ? '오늘 매출 상세'
              : selectedDetail === 'pending_paid'
                ? '결제대기 / 결제완료'
                : selectedDetail === 'visitors' || selectedDetail === 'period'
                    ? `기간별 통계 (${PERIODS.find((x) => x.key === period)?.label})`
                    : '';

    const showPeriodTable = selectedDetail === 'visitors' || selectedDetail === 'period';
    const showOrdersTable =
        selectedDetail === 'orders_today' || selectedDetail === 'pending_paid';
    const showRevenueBreakdown = selectedDetail === 'revenue_today';

    const sortedDetailOrders = useMemo(() =>
        [...detailOrders].sort((a, b) =>
            new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        ),
        [detailOrders]
    );
    const sortedDetailOrdersPending = useMemo(() =>
        [...detailOrdersPending].sort((a, b) =>
            new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        ),
        [detailOrdersPending]
    );
    const sortedDetailOrdersPaid = useMemo(() =>
        [...detailOrdersPaid].sort((a, b) =>
            new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        ),
        [detailOrdersPaid]
    );
    const sortedPeriodStats = useMemo(() => {
        const list = [...periodStats];
        if (period === 'week') return list;
        return list.reverse();
    }, [periodStats, period]);

    return (
        <div className={styles.dashboardLayout}>
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <p className={styles.pageLabel}>Overview</p>
                <h2 className={styles.pageTitle}>Dashboard</h2>
            </div>

            {statsError && (
                <p className={styles.errorText}>{statsError}</p>
            )}

            <div className={styles.statsGrid}>
                {statCards.map((s) => (
                    <button
                        key={s.label}
                        type="button"
                        className={`${styles.statCard} ${s.alert ? styles.statAlert : ''}`}
                        onClick={() => handleStatClick(s.detail)}
                    >
                        <p className={styles.statLabel}>{s.label}</p>
                        <p className={styles.statValue}>{s.value}</p>
                        <p className={styles.statSub}>{s.sub}</p>
                    </button>
                ))}
            </div>

            <div className={styles.divider} />

            {/* 기간 선택 탭 */}
            <div className={styles.periodSection}>
                <p className={styles.pageLabel}>기간별 통계</p>
                <div className={styles.periodTabs}>
                    {PERIODS.map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            className={`${styles.periodTab} ${period === key ? styles.periodTabActive : ''}`}
                            onClick={() => { setPeriod(key); setSelectedDetail('period'); }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                {periodError && <p className={styles.errorText}>{periodError}</p>}
                <button
                    type="button"
                    className={styles.periodSummary}
                    onClick={() => setSelectedDetail('period')}
                >
                    <span>선택 기간 주문 <strong>{periodTotalOrders}</strong>건</span>
                    <span>매출 <strong>₩{periodTotalRevenue.toLocaleString()}</strong></span>
                </button>
            </div>

            {/* 차트 */}
            {chartData.length > 0 && (
                <div className={styles.charts}>
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>주문 건수</h3>
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.4)" />
                                    <YAxis tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.4)" />
                                    <Tooltip
                                        formatter={(value: unknown) => [(Number(value) ?? 0).toLocaleString(), '주문']}
                                        contentStyle={{ fontSize: 12 }}
                                    />
                                    <Bar dataKey="주문" fill="rgba(28,25,23,0.75)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>매출</h3>
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                                    <defs>
                                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="rgba(28,25,23,0.35)" />
                                            <stop offset="100%" stopColor="rgba(28,25,23,0.02)" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.4)" />
                                    <YAxis tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.4)" tickFormatter={(v) => `₩${(v / 10000).toFixed(0)}만`} />
                                    <Tooltip
                                        formatter={(value: unknown) => [`₩${(Number(value) ?? 0).toLocaleString()}`, '매출']}
                                        contentStyle={{ fontSize: 12 }}
                                    />
                                    <Area type="monotone" dataKey="매출" stroke="rgba(28,25,23,0.7)" fill="url(#revenueGradient)" strokeWidth={1.5} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>방문자 수</h3>
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.4)" />
                                    <YAxis tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.4)" />
                                    <Tooltip
                                        formatter={(value: unknown) => [(Number(value) ?? 0).toLocaleString(), '방문자']}
                                        contentStyle={{ fontSize: 12 }}
                                    />
                                    <Bar dataKey="방문자" fill="rgba(0,0,0,0.2)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.divider} />

            <div className={styles.quickLinks}>
                <p className={styles.pageLabel}>Quick Actions</p>
                <div className={styles.quickGrid}>
                    {[
                        { href: '/admin/orders', label: '주문 관리' },
                        { href: '/admin/menus/new', label: '메뉴 추가' },
                        { href: '/admin/menus', label: '메뉴 관리' },
                        { href: '/admin/rag', label: 'RAG 관리' },
                    ].map((link) => (
                        <Link key={link.href} href={link.href} className={styles.quickLink}>
                            <span>{link.label}</span>
                            <span className={styles.quickArrow}>→</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>

            {/* 오른쪽 데이터 분석 패널 */}
            {selectedDetail && (
                <aside className={styles.detailPanel}>
                    <div className={styles.detailPanelHeader}>
                        <h3 className={styles.detailPanelTitle}>{detailTitle}</h3>
                        <button
                            type="button"
                            className={styles.detailPanelClose}
                            onClick={() => setSelectedDetail(null)}
                            aria-label="닫기"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className={styles.detailPanelBody}>
                        {showRevenueBreakdown && (
                            <>
                                {detailLoading && <p className={styles.detailLoading}>불러오는 중...</p>}
                                {detailError && <p className={styles.errorText}>{detailError}</p>}
                                {!detailLoading && !detailError && todayRevenueBreakdown && (
                                    <>
                                        <div className={styles.revenueSummary}>
                                            <p><strong>총건수</strong> {todayRevenueBreakdown.totalCount.toLocaleString()}건</p>
                                            <p><strong>총매출</strong> ₩{todayRevenueBreakdown.totalRevenue.toLocaleString()}</p>
                                        </div>
                                        <p className={styles.breakdownSectionTitle}>상품별 (건수 / 매출)</p>
                                        <div className={styles.detailTableWrap}>
                                            <table className={styles.detailTable}>
                                                <thead>
                                                    <tr>
                                                        <th>상품명</th>
                                                        <th>건수</th>
                                                        <th>매출</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {todayRevenueBreakdown.byProduct.length === 0 ? (
                                                        <tr><td colSpan={3} className={styles.detailEmpty}>데이터가 없습니다.</td></tr>
                                                    ) : (
                                                        todayRevenueBreakdown.byProduct.map((row, i) => (
                                                            <tr key={i}>
                                                                <td>{row.menuName}</td>
                                                                <td>{row.count.toLocaleString()}</td>
                                                                <td>₩{row.revenue.toLocaleString()}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className={styles.breakdownSectionTitle}>카테고리별 (건수 / 매출)</p>
                                        <div className={styles.detailTableWrap}>
                                            <table className={styles.detailTable}>
                                                <thead>
                                                    <tr>
                                                        <th>카테고리</th>
                                                        <th>건수</th>
                                                        <th>매출</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {todayRevenueBreakdown.byCategory.length === 0 ? (
                                                        <tr><td colSpan={3} className={styles.detailEmpty}>데이터가 없습니다.</td></tr>
                                                    ) : (
                                                        todayRevenueBreakdown.byCategory.map((row, i) => (
                                                            <tr key={i}>
                                                                <td>{row.categoryName}</td>
                                                                <td>{row.count.toLocaleString()}</td>
                                                                <td>₩{row.revenue.toLocaleString()}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                        {showOrdersTable && (
                            <>
                                {detailLoading && <p className={styles.detailLoading}>불러오는 중...</p>}
                                {detailError && <p className={styles.errorText}>{detailError}</p>}
                                {!detailLoading && !detailError && selectedDetail === 'orders_today' && (
                                    <div className={styles.detailTableWrap}>
                                        <table className={styles.detailTable}>
                                            <thead>
                                                <tr>
                                                    <th>주문번호</th>
                                                    <th>상태</th>
                                                    <th>금액</th>
                                                    <th>품목수</th>
                                                    <th>주문일시</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedDetailOrders.length === 0 ? (
                                                    <tr><td colSpan={6} className={styles.detailEmpty}>데이터가 없습니다.</td></tr>
                                                ) : (
                                                    sortedDetailOrders.map((o) => (
                                                        <tr key={o.id}>
                                                            <td>{o.id}</td>
                                                            <td>{getOrderStatusLabel(o.status)}</td>
                                                            <td>₩{(o.totalAmount ?? 0).toLocaleString()}</td>
                                                            <td>{o.itemCount ?? 0}</td>
                                                            <td>{o.createdAt ? new Date(o.createdAt).toLocaleString('ko-KR') : '-'}</td>
                                                            <td><Link href={`/admin/orders/${o.id}`} className={styles.detailLink}>상세</Link></td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                {!detailLoading && !detailError && selectedDetail === 'pending_paid' && (
                                    <>
                                        <p className={styles.breakdownSectionTitle}>결제대기</p>
                                        <div className={styles.detailTableWrap}>
                                            <table className={styles.detailTable}>
                                                <thead>
                                                    <tr>
                                                        <th>주문번호</th>
                                                        <th>금액</th>
                                                        <th>품목수</th>
                                                        <th>주문일시</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sortedDetailOrdersPending.length === 0 ? (
                                                        <tr><td colSpan={5} className={styles.detailEmpty}>데이터가 없습니다.</td></tr>
                                                    ) : (
                                                        sortedDetailOrdersPending.map((o) => (
                                                            <tr key={o.id}>
                                                                <td>{o.id}</td>
                                                                <td>₩{(o.totalAmount ?? 0).toLocaleString()}</td>
                                                                <td>{o.itemCount ?? 0}</td>
                                                                <td>{o.createdAt ? new Date(o.createdAt).toLocaleString('ko-KR') : '-'}</td>
                                                                <td><Link href={`/admin/orders/${o.id}`} className={styles.detailLink}>상세</Link></td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className={styles.breakdownSectionTitle}>결제완료</p>
                                        <div className={styles.detailTableWrap}>
                                            <table className={styles.detailTable}>
                                                <thead>
                                                    <tr>
                                                        <th>주문번호</th>
                                                        <th>금액</th>
                                                        <th>품목수</th>
                                                        <th>주문일시</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sortedDetailOrdersPaid.length === 0 ? (
                                                        <tr><td colSpan={5} className={styles.detailEmpty}>데이터가 없습니다.</td></tr>
                                                    ) : (
                                                        sortedDetailOrdersPaid.map((o) => (
                                                            <tr key={o.id}>
                                                                <td>{o.id}</td>
                                                                <td>₩{(o.totalAmount ?? 0).toLocaleString()}</td>
                                                                <td>{o.itemCount ?? 0}</td>
                                                                <td>{o.createdAt ? new Date(o.createdAt).toLocaleString('ko-KR') : '-'}</td>
                                                                <td><Link href={`/admin/orders/${o.id}`} className={styles.detailLink}>상세</Link></td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                        {showPeriodTable && (
                            <div className={styles.detailTableWrap}>
                                <table className={styles.detailTable}>
                                    <thead>
                                        <tr>
                                            <th>기간</th>
                                            <th>주문(건)</th>
                                            <th>매출(원)</th>
                                            <th>방문자</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedPeriodStats.length === 0 ? (
                                            <tr><td colSpan={4} className={styles.detailEmpty}>데이터가 없습니다.</td></tr>
                                        ) : (
                                            sortedPeriodStats.map((p, i) => (
                                                <tr key={i}>
                                                    <td>{p.label}</td>
                                                    <td>{(p.orderCount ?? 0).toLocaleString()}</td>
                                                    <td>₩{(p.revenue ?? 0).toLocaleString()}</td>
                                                    <td>{(p.visitorCount ?? 0).toLocaleString()}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </aside>
            )}
        </div>
    );
}
