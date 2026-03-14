'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './MenusHeroShowcase.module.css';

const SLIDE_INTERVAL_MS = 5000;

/** 카페 히어로 슬라이드 6종 — 커피·카페·디저트 톤 */
const HERO_SLIDES = [
  { id: 'brew', en: 'Fresh Brew', image: '/images/menus-hero/hero-1.png' },
  { id: 'space', en: 'Our Space', image: '/images/menus-hero/hero-2.png' },
  { id: 'moment', en: 'Stay A While', image: '/images/menus-hero/hero-3.png' },
  { id: 'beans', en: 'Every Bean', image: '/images/menus-hero/hero-4.png' },
  { id: 'bakery', en: 'Daily Bake', image: '/images/menus-hero/hero-5.png' },
  { id: 'savor', en: 'Savor the Moment', image: '/images/menus-hero/hero-6.png' },
] as const;

export default function MenusHeroShowcase() {
  const [index, setIndex] = useState(0);
  const count = HERO_SLIDES.length;

  const goTo = useCallback((next: number) => {
    setIndex((i) => (next + count) % count);
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => goTo(index + 1), SLIDE_INTERVAL_MS);
    return () => clearInterval(t);
  }, [count, index, goTo]);

  return (
    <div className={styles.hero} aria-label="카페 소개 슬라이드">
      <div className={styles.sliderWrap}>
        <div
          className={styles.slideTrack}
          style={{ transform: `translateX(-${index * 100}%)` }}
          aria-roledescription="carousel"
        >
          {HERO_SLIDES.map((slide, i) => {
            const isActive = i === index;
            return (
              <div key={slide.id} className={styles.slideOuter}>
                <div className={styles.slide} aria-hidden={!isActive}>
                  <div className={styles.slideImageWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.image}
                      alt=""
                      className={styles.slideImage}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                    <div className={styles.slideOverlay} aria-hidden="true" />
                    <div className={`${styles.slideCaption} ${isActive ? styles.slideCaptionActive : ''}`}>
                      <span className={styles.slideLabel}>{slide.en}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.dots} role="tablist" aria-label="슬라이드 위치">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`슬라이드 ${i + 1}`}
              className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
