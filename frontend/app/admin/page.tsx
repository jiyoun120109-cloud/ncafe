'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

export default function AdminDashboardPage() {
    const { setTitle } = useUIStore();

    useEffect(() => {
        setTitle('대시보드');
    }, [setTitle]);

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-6)'
        }}>
            {/* Summary Cards */}
            <div style={{ background: 'white', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gray-200)' }}>
                <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginBottom: 'var(--space-2)' }}>오늘의 주문</h3>
                <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)' }}>12건</p>
            </div>
            <div style={{ background: 'white', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gray-200)' }}>
                <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginBottom: 'var(--space-2)' }}>오늘의 매출</h3>
                <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)' }}>154,000원</p>
            </div>
            <div style={{ background: 'white', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gray-200)' }}>
                <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginBottom: 'var(--space-2)' }}>품절 메뉴</h3>
                <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-error)' }}>2개</p>
            </div>
        </div>
    );
}
