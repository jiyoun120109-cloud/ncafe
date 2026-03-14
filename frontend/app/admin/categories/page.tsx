'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import CategoryManage from '../_components/CategoryManage/CategoryManage';
import { useAdminCategories } from '../_components/useAdminCategories';
import styles from './page.module.css';

export default function AdminCategoriesPage() {
    const { setTitle } = useUIStore();
    const {
        categories,
        loading,
        createCategory,
        updateCategory,
        deleteCategory,
    } = useAdminCategories();

    useEffect(() => {
        setTitle('카테고리 관리');
    }, [setTitle]);

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <p className={styles.pageLabel}>Category Management</p>
                <h2 className={styles.pageTitle}>카테고리 관리</h2>
            </div>

            <div className={styles.divider} />

            <CategoryManage
                categories={categories}
                loading={loading}
                onCreate={async (name: string) => createCategory(name)}
                onUpdate={updateCategory}
                onDelete={deleteCategory}
            />
        </div>
    );
}
