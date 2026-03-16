`use client`;

import Link from 'next/link';
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
                        </tr>
                    </thead>
                    <tbody>
                        {menus.map((menu, index) => (
                            <tr key={menu.id}>
                                <td>{index + 1}</td>
                                <td>{menu.id}</td>
                                <td>
                                    {menu.korName ? (
                                        <Link href={`/admin/menus/${menu.id}`} className={styles.nameLink}>
                                            {menu.korName}
                                        </Link>
                                    ) : (
                                        '-'
                                    )}
                                </td>
                                <td>
                                    {menu.engName ? (
                                        <Link href={`/admin/menus/${menu.id}`} className={styles.nameLink}>
                                            {menu.engName}
                                        </Link>
                                    ) : (
                                        '-'
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
