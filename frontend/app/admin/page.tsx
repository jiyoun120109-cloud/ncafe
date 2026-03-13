'use client';

import { useEffect, useState, useCallback } from 'react';
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
import { useUIStore } from '@/stores/uiStore';
import {
    fetchAdminOrderStats,
    fetchAdminOrderStatsPeriod,
    type AdminOrderStats,
    type AdminOrderStatsPeriodPoint,
    type StatsPeriod,
} from '@/services/adminOrderService';
import styles from './page.module.css';

const PERIODS: { key: StatsPeriod; label: string }[] = [
    { key: 'day', label: '일간' },
    { key: 'week', label: '주간' },
    { key: 'month', label: '월간' },
];

export default function AdminDashboardPage() {
    const { setTitle } = useUIStore();
    const [stats, setStats] = useState<AdminOrderStats | null>(null);
    const [periodStats, setPeriodStats] = useState<AdminOrderStatsPeriodPoint[]>([]);
    const [period, setPeriod] = useState<StatsPeriod>('day');
    const [statsError, setStatsError] = useState<string | null>(null);
    const [periodError, setPeriodError] = useState<string | null>(null);

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

    const statCards = [
        { label: '오늘 주문', value: String(ordersToday), sub: orderDiffText },
        { label: '오늘 매출', value: `₩${revenueToday.toLocaleString()}`, sub: revenueDiffText },
        { label: '결제대기', value: String(pendingCount), sub: '주문 관리에서 확인', alert: pendingCount > 0 },
        { label: '결제완료', value: String(paidCount), sub: '처리 대기 중' },
        { label: '방문자 수', value: periodTotalVisitors.toLocaleString(), sub: `선택 기간 합계 (${PERIODS.find((x) => x.key === period)?.label})` },
    ];

    const chartData = periodStats.map((p) => ({
        name: p.label,
        주문: p.orderCount ?? 0,
        매출: p.revenue ?? 0,
        방문자: p.visitorCount ?? 0,
    }));

    return (
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
                    <div key={s.label} className={`${styles.statCard} ${s.alert ? styles.statAlert : ''}`}>
                        <p className={styles.statLabel}>{s.label}</p>
                        <p className={styles.statValue}>{s.value}</p>
                        <p className={styles.statSub}>{s.sub}</p>
                    </div>
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
                            onClick={() => setPeriod(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                {periodError && <p className={styles.errorText}>{periodError}</p>}
                <div className={styles.periodSummary}>
                    <span>선택 기간 주문 <strong>{periodTotalOrders}</strong>건</span>
                    <span>매출 <strong>₩{periodTotalRevenue.toLocaleString()}</strong></span>
                </div>
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
                        <a key={link.href} href={link.href} className={styles.quickLink}>
                            <span>{link.label}</span>
                            <span className={styles.quickArrow}>→</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
