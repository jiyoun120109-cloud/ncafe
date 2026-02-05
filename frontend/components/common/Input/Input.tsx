'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, fullWidth = false, className = '', ...props }, ref) => {
        const containerClasses = [
            styles.container,
            fullWidth ? styles.fullWidth : '',
        ].join(' ');

        const inputClasses = [
            styles.input,
            error ? styles.errorInput : '',
            className,
        ].join(' ');

        return (
            <div className={containerClasses}>
                {label && <label className={styles.label}>{label}</label>}
                <input ref={ref} className={inputClasses} {...props} />
                {error && <span className={styles.errorText}>{error}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
