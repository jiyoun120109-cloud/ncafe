'use client';

import { useEffect, useState } from 'react';
import styles from './StampCard.module.css';

/** 2x2 강아지 콜라주 이미지에서 칸(0~3)에 해당하는 background-position (left top 기준 %) */
const QUADRANT_POSITIONS: [string, string][] = [
  ['0%', '0%'],      // 좌상
  ['100%', '0%'],    // 우상
  ['0%', '100%'],   // 좌하
  ['100%', '100%'], // 우하
];

export interface StampCardProps {
  stampCount: number;
  requiredForReward: number;
  /** 2x2 강아지 이미지 경로 (public 기준). 없으면 이모지 폴백 */
  stampImagePath?: string;
  rewardDescription?: string;
}

export default function StampCard({
  stampCount,
  requiredForReward,
  stampImagePath = '/images/loyalty-card.png',
  rewardDescription = '10개 모이면 아메리카노 1잔 무료!',
}: StampCardProps) {
  const [mounted, setMounted] = useState(false);
  const slots = Array.from({ length: Math.max(0, requiredForReward) }, (_, i) => i);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={styles.card}>
      <p className={styles.summary}>
        적립 스탬프 <strong>{stampCount}</strong> / {requiredForReward}개
      </p>
      <p className={styles.hint}>{rewardDescription}</p>
      <div className={styles.slots} role="list" aria-label={`스탬프 ${stampCount}개 적립`}>
        {slots.map((index) => {
          const filled = index < stampCount;
          const quadrantIndex = index % 4;
          const [posX, posY] = QUADRANT_POSITIONS[quadrantIndex];
          const animate = mounted && filled;
          return (
            <div
              key={index}
              role="listitem"
              className={`${styles.slot} ${filled ? styles.filled : styles.empty}`}
              style={
                filled && stampImagePath
                  ? {
                      backgroundImage: `url(${stampImagePath})`,
                      backgroundSize: '200% 200%',
                      backgroundPosition: `${posX} ${posY}`,
                    }
                  : undefined
              }
              data-animate={animate ? 'yes' : undefined}
              data-index={index}
            >
              {filled && !stampImagePath && <span className={styles.placeholder}>🐕</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
