'use client';

import type { MenuResponse } from '../MenuList/useMenus';
import styles from './RankingTable.module.css';

interface RankingTableProps {
    menus: MenuResponse[];
}

export default function RankingTable({ menus }: RankingTableProps) {
    if (menus.length === 0) {
        return (
            <div className={styles.wrapper}>
                <h3 className={styles.title}>랭킹</h3>
                <p className={styles.empty}>메뉴가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <h3 className={styles.title}>랭킹</h3>
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>순위</th>
                            <th>메뉴아이디</th>
                            <th>한글이름</th>
                            <th>영어이름</th>
                            <th>카테고리아이디</th>
                        </tr>
                    </thead>
                    <tbody>
                        {menus.map((menu, index) => (
                            <tr key={menu.id}>
                                <td>{index + 1}</td>
                                <td>{menu.id}</td>
                                <td>{menu.korName ?? '-'}</td>
                                <td>{menu.engName ?? '-'}</td>
                                <td>{menu.categoryId ?? '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
