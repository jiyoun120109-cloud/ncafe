'use client';

import Link from 'next/link';
import { ShoppingCart, ClipboardList, CreditCard, ChevronRight } from 'lucide-react';
import styles from './CheckoutLayout.module.css';

export type CheckoutStep = 'cart' | 'order' | 'payment';

const STEPS: { key: CheckoutStep; label: string; href: string; icon: React.ReactNode }[] = [
  { key: 'cart', label: '장바구니', href: '/cart', icon: <ShoppingCart size={16} /> },
  { key: 'order', label: '주문하기', href: '/order', icon: <ClipboardList size={16} /> },
  { key: 'payment', label: '결제', href: '#', icon: <CreditCard size={16} /> },
];

interface CheckoutLayoutProps {
  currentStep: CheckoutStep;
  children: React.ReactNode;
}

export default function CheckoutLayout({ currentStep, children }: CheckoutLayoutProps) {
  return (
    <div className={styles.root}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.steps} aria-label="주문 단계">
            {STEPS.map((step, i) => {
              const isActive = step.key === currentStep;
              const isPast = STEPS.findIndex((s) => s.key === currentStep) > i;
              const isLast = i === STEPS.length - 1;
              return (
                <span key={step.key} className={styles.stepWrap}>
                  {i > 0 && <ChevronRight size={12} className={styles.stepSep} aria-hidden />}
                  {isLast ? (
                    <span
                      className={`${styles.step} ${isActive ? styles.stepActive : ''} ${isPast ? styles.stepPast : ''}`}
                      aria-current={isActive ? 'step' : undefined}
                    >
                      {step.icon}
                      <span>{step.label}</span>
                    </span>
                  ) : (
                    <Link
                      href={step.href}
                      className={`${styles.step} ${styles.stepLink} ${isActive ? styles.stepActive : ''} ${isPast ? styles.stepPast : ''}`}
                      aria-current={isActive ? 'step' : undefined}
                    >
                      {step.icon}
                      <span>{step.label}</span>
                    </Link>
                  )}
                </span>
              );
            })}
          </nav>
          <h1 className={styles.heroTitle}>
            {currentStep === 'cart' && '장바구니'}
            {currentStep === 'order' && '주문하기'}
            {currentStep === 'payment' && '결제'}
          </h1>
          <p className={styles.heroSub}>
            {currentStep === 'cart' && '담은 메뉴를 확인하고 주문을 진행해 보세요'}
            {currentStep === 'order' && '주문 내용을 확인한 뒤 결제를 진행해 주세요'}
            {currentStep === 'payment' && '선택한 결제 수단으로 안전하게 결제해 주세요'}
          </p>
        </div>
      </div>
      <main className={styles.main}>
        <div className={styles.container}>{children}</div>
      </main>
    </div>
  );
}
