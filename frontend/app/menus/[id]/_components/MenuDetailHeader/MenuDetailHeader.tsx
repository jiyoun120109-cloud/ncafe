'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import styles from './MenuDetailHeader.module.css';

const LAST_MENUS_PATH_KEY = 'ncafe_last_menus_path';

export default function MenuDetailHeader() {
    const [backHref, setBackHref] = useState('/menus');

    useEffect(() => {
        try {
            const saved = sessionStorage.getItem(LAST_MENUS_PATH_KEY);
            if (saved && saved.startsWith('/menus')) setBackHref(saved);
        } catch (_) {}
    }, []);

    return (
        <div className={styles.header}>
            <Link href={backHref} className={styles.backBtn}>
                <ChevronLeft size={20} aria-hidden />
                <span>목록으로</span>
            </Link>
        </div>
    );
}
