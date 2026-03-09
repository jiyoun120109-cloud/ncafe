'use client';

import Link from 'next/link';
import { CreditCard, ChevronLeft } from 'lucide-react';

export default function OrderPage() {
    return (
        <main style={{ minHeight: '60vh', maxWidth: 640, margin: '0 auto', padding: '2rem 1.5rem' }}>
            <Link
                href="/cart"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.85rem',
                    color: 'rgba(0,0,0,0.5)',
                    textDecoration: 'none',
                    marginBottom: '1rem',
                }}
            >
                <ChevronLeft size={18} />
                장바구니로
            </Link>
            <div
                style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    background: '#fff',
                    borderRadius: 8,
                    border: '1px solid rgba(0,0,0,0.08)',
                }}
            >
                <CreditCard size={48} style={{ color: 'rgba(0,0,0,0.2)', marginBottom: '1rem' }} />
                <p style={{ fontSize: '1rem', color: 'rgba(0,0,0,0.6)', marginBottom: '1.5rem' }}>
                    주문 페이지는 준비 중입니다.
                </p>
                <Link
                    href="/menus"
                    style={{
                        display: 'inline-block',
                        padding: '0.6rem 1.25rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#fff',
                        background: 'var(--color-primary-600, #8b5a2b)',
                        borderRadius: 6,
                        textDecoration: 'none',
                    }}
                >
                    메뉴 보기
                </Link>
            </div>
        </main>
    );
}
