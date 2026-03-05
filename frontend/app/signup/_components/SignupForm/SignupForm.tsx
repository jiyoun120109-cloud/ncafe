'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { signupApi } from '@/services/authService';
import styles from './SignupForm.module.css';

interface SignupFormValues {
    username: string;
    password: string;
    passwordConfirm: string;
}

interface SignupFormProps {
    onError: (message: string) => void;
}

export default function SignupForm({ onError }: SignupFormProps) {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<SignupFormValues>();

    const password = watch('password');

    const onSubmit = async (data: SignupFormValues) => {
        setIsLoading(true);
        onError('');

        try {
            const result = await signupApi(data.username, data.password);
            if (result.success) {
                router.push('/login?registered=1');
                return;
            }
            onError(result.message || '회원가입에 실패했습니다.');
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
                                minLength: { value: 2, message: '아이디는 2자 이상 입력해주세요.' },
                            })}
                        />
                    </div>
                    {errors.username && (
                        <span className={styles.fieldError}>{errors.username.message}</span>
                    )}
                </div>

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
                            placeholder="비밀번호 (4자 이상)"
                            autoComplete="new-password"
                            {...register('password', {
                                required: '비밀번호를 입력해주세요.',
                                minLength: { value: 4, message: '비밀번호는 4자 이상 입력해주세요.' },
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

                <div className={styles.fieldGroup}>
                    <label htmlFor="passwordConfirm" className={styles.label}>
                        비밀번호 확인
                    </label>
                    <div className={styles.inputWrapper}>
                        <Lock className={styles.inputIcon} />
                        <input
                            id="passwordConfirm"
                            type={showPassword ? 'text' : 'password'}
                            className={`${styles.input} ${errors.passwordConfirm ? styles.inputError : ''}`}
                            placeholder="비밀번호를 다시 입력하세요"
                            autoComplete="new-password"
                            {...register('passwordConfirm', {
                                required: '비밀번호 확인을 입력해주세요.',
                                validate: (value) =>
                                    value === password || '비밀번호가 일치하지 않습니다.',
                            })}
                        />
                    </div>
                    {errors.passwordConfirm && (
                        <span className={styles.fieldError}>{errors.passwordConfirm.message}</span>
                    )}
                </div>

                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className={styles.spinner} />
                    ) : (
                        <span className={styles.buttonText}>회원가입</span>
                    )}
                </button>
            </form>

            <div className={styles.footer}>
                <span>이미 계정이 있으신가요?</span>
                <Link href="/login" className={styles.footerLink}>
                    로그인
                </Link>
            </div>
        </>
    );
}
