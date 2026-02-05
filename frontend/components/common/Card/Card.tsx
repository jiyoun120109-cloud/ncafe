import { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
    children: ReactNode;
    className?: string;
    padding?: boolean;
}

export default function Card({ children, className = '', padding = true }: CardProps) {
    return (
        <div className={`${styles.card} ${padding ? styles.padding : ''} ${className}`}>
            {children}
        </div>
    );
}
