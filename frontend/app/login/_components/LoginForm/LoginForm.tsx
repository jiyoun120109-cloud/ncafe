'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { loginApi } from '@/services/authService';
import styles from './LoginForm.module.css';

interface LoginFormValues {
    username: string;
    password: string;
}

interface LoginFormProps {
    onError: (message: string) => void;
    returnUrl?: string;
}

export default function LoginForm({ onError, returnUrl = '' }: LoginFormProps) {
    const router = useRouter();
    const { setUser } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>();

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        onError('');

        try {
            const user = await loginApi(data.username, data.password);
            setUser(user);
            // 관리자만 /admin으로, returnUrl 있으면 해당 경로로, 없으면 홈
            if (user.role === 'ADMIN' && !returnUrl) {
                router.push('/admin');
            } else if (returnUrl && returnUrl.startsWith('/')) {
                router.push(returnUrl);
            } else {
                router.push('/');
            }
        } catch (err) {
            const message = err instanceof Error
                ? err.message
                : '서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
            onError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                {/* 아이디 */}
                <div className={styles.fieldGroup}>
                    <label htmlFor="username" className={styles.label}>
                        아이디
                    </label>
                    <div className={styles.inputWrapper}>
                        <User className={styles.inputIcon} />
                        <input
                            id="username"
                            type="text"
                            className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
                            placeholder="아이디를 입력하세요"
                            autoComplete="username"
                            {...register('username', {
                                required: '아이디를 입력해주세요.',
                            })}
                        />
                    </div>
                    {errors.username && (
                        <span className={styles.fieldError}>{errors.username.message}</span>
                    )}
                </div>

                {/* 비밀번호 */}
                <div className={styles.fieldGroup}>
                    <label htmlFor="password" className={styles.label}>
                        비밀번호
                    </label>
                    <div className={styles.inputWrapper}>
                        <Lock className={styles.inputIcon} />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                            placeholder="비밀번호를 입력하세요"
                            autoComplete="current-password"
                            {...register('password', {
                                required: '비밀번호를 입력해주세요.',
                            })}
                        />
                        <button
                            type="button"
                            className={styles.togglePassword}
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && (
                        <span className={styles.fieldError}>{errors.password.message}</span>
                    )}
                </div>

                {/* 로그인 버튼 */}
                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className={styles.spinner} />
                    ) : (
                        <span className={styles.buttonText}>로그인</span>
                    )}
                </button>
            </form>

            {/* 하단 링크 */}
            <div className={styles.footer}>
                <span>계정이 없으신가요?</span>
                <Link href="/signup" className={styles.footerLink}>
                    회원가입
                </Link>
            </div>
        </>
    );
}
