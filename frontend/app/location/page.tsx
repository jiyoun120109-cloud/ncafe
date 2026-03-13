'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { MapPin, ArrowLeft, Clock } from 'lucide-react';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import PageWithHero from '@/components/PageWithHero/PageWithHero';
import styles from './page.module.css';

const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY || '';
const DEFAULT_LAT = 37.5665;
const DEFAULT_LNG = 126.978;

declare global {
  interface Window {
    kakao?: {
      maps: {
        load: (callback: () => void) => void;
        LatLng: new (lat: number, lng: number) => { getLat: () => number; getLng: () => number };
        Map: new (container: HTMLElement, options: { center: unknown; level: number }) => void;
        Marker: new (options: { position: unknown }) => { setMap: (map: unknown) => void };
        event: { addListener: (target: unknown, type: string, handler: () => void) => void };
      };
    };
  }
}

export default function LocationPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { siteName, address, businessHours } = useSiteSettings();

  useEffect(() => {
    if (!scriptLoaded || !mapRef.current || typeof window === 'undefined' || !window.kakao?.maps) return;

    const kakao = window.kakao;
    if (!kakao?.maps) return;

    kakao.maps.load(() => {
      const k = window.kakao;
      const container = mapRef.current;
      if (!container || !k?.maps) return;

      const center = new k.maps.LatLng(DEFAULT_LAT, DEFAULT_LNG);
      const mapOption = {
        center,
        level: 3,
      };
      const map = new k.maps.Map(container, mapOption);

      const marker = new k.maps.Marker({ position: center });
      marker.setMap(map);
    });
  }, [scriptLoaded]);

  return (
    <>
      {KAKAO_APP_KEY && (
        <Script
          src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`}
          strategy="afterInteractive"
          onLoad={() => setScriptLoaded(true)}
        />
      )}
      <PageWithHero
        title="매장 위치"
        subtitle={`${siteName || 'NCafe'}를 찾아오시는 길`}
      >
        <div className={styles.page}>
          <div className={styles.topRow}>
            <Link href="/" className={styles.backLink}>
              <ArrowLeft size={18} />
              이전으로
            </Link>
          </div>

          <section className={styles.section}>
            {KAKAO_APP_KEY ? (
              <div ref={mapRef} id="kakao-map" className={styles.mapContainer} />
            ) : (
              <div className={styles.mapContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-subtle, #f5f5f4)', color: '#78716c' }}>
                지도를 사용하려면 환경 변수 NEXT_PUBLIC_KAKAO_MAP_APP_KEY를 설정해 주세요.
              </div>
            )}
          </section>

          <section className={styles.infoSection}>
            <h2 className={styles.infoTitle}>오시는 길</h2>
            {address ? (
              <p className={styles.address}>
                <MapPin size={18} className={styles.addressIcon} aria-hidden />
                {address}
              </p>
            ) : (
              <p className={styles.address}>
                <MapPin size={18} className={styles.addressIcon} aria-hidden />
                서울특별시 중구 세종대로 110 (예시)
              </p>
            )}
            {businessHours && (
              <p className={styles.hours}>
                <Clock size={18} className={styles.hoursIcon} aria-hidden />
                {businessHours}
              </p>
            )}
            <p className={styles.hint}>
              관리자 설정에서 주소를 입력하면 지도와 여기에 반영됩니다.
            </p>
          </section>
        </div>
      </PageWithHero>
    </>
  );
}
