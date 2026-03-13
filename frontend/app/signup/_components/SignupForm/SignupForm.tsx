'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, UserCircle, Calendar, Phone, AtSign, Mail } from 'lucide-react';
import { signupApi, checkUsernameApi } from '@/services/authService';
import styles from './SignupForm.module.css';

interface SignupFormValues {
    username: string;
    password: string;
    passwordConfirm: string;
    name: string;
    birthDate: string;
    phone: string;
    displayNickname: string;
    email: string;
}

interface SignupFormProps {
    onError: (message: string) => void;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_MIN_LENGTH = 6;
const NICKNAME_REGEX = /^[a-zA-Z0-9가-힣_]{2,20}$/;

export default function SignupForm({ onError }: SignupFormProps) {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [usernameCheckStatus, setUsernameCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const [usernameCheckedValue, setUsernameCheckedValue] = useState('');

    const {
        register,
        handleSubmit,
        watch,
        setError,
        clearErrors,
        formState: { errors },
    } = useForm<SignupFormValues>({ mode: 'onBlur' });

    const password = watch('password');
    const username = watch('username');

    const handleCheckUsername = async () => {
        const value = (username || '').trim();
        if (!value) {
            setError('username', { message: '아이디를 먼저 입력해주세요.' });
            return;
        }
        if (value.length < 2) {
            setError('username', { message: '아이디는 2자 이상 입력해주세요.' });
            return;
        }
        clearErrors('username');
        setUsernameCheckStatus('checking');
        try {
            const available = await checkUsernameApi(value);
            setUsernameCheckedValue(value);
            setUsernameCheckStatus(available ? 'available' : 'taken');
            if (!available) {
                setError('username', { message: '이미 사용 중인 아이디입니다.' });
            }
        } catch {
            setUsernameCheckStatus('idle');
            onError('아이디 확인에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const onSubmit = async (data: SignupFormValues) => {
        if (usernameCheckStatus !== 'available' || (data.username || '').trim() !== usernameCheckedValue) {
            onError('아이디 중복 확인을 해주세요.');
            setError('username', { message: '사용 가능한 아이디인지 중복 확인 버튼을 눌러주세요.' });
            return;
        }

        setIsLoading(true);
        onError('');

        try {
            const result = await signupApi({
                username: data.username.trim(),
                password: data.password,
                name: data.name.trim() || undefined,
                birthDate: data.birthDate || undefined,
                phone: data.phone.trim() || undefined,
                displayNickname: data.displayNickname.trim() || undefined,
                email: data.email?.trim() || undefined,
            });
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
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className={styles.fieldGroup}>
                    <label htmlFor="username" className={styles.label}>
                        아이디
                    </label>
                    <div className={styles.inputRow}>
                        <div className={styles.inputWrapper}>
                            <User className={styles.inputIcon} />
                            <input
                                id="username"
                                type="text"
                                className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
                                placeholder="영문, 숫자 2~20자 (예: myid123)"
                                autoComplete="username"
                                {...register('username', {
                                    required: '아이디를 입력해주세요.',
                                    minLength: { value: 2, message: '아이디는 2자 이상 입력해주세요.' },
                                    maxLength: { value: 20, message: '아이디는 20자 이하로 입력해주세요.' },
                                    pattern: {
                                        value: /^[a-zA-Z0-9]{2,20}$/,
                                        message: '아이디는 영문, 숫자만 사용 가능합니다.',
                                    },
                                    onChange: () => {
                                        if (usernameCheckStatus !== 'idle') {
                                            setUsernameCheckStatus('idle');
                                            setUsernameCheckedValue('');
                                        }
                                    },
                                })}
                            />
                        </div>
                        <button
                            type="button"
                            className={styles.checkButton}
                            onClick={handleCheckUsername}
                            disabled={usernameCheckStatus === 'checking'}
                        >
                            {usernameCheckStatus === 'checking' ? '확인 중...' : '중복 확인'}
                        </button>
                    </div>
                    {usernameCheckStatus === 'available' && (
                        <span className={styles.fieldSuccess}>사용 가능한 아이디입니다.</span>
                    )}
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
                            placeholder="영문+숫자 조합 6자 이상 (예: abc123)"
                            autoComplete="new-password"
                            {...register('password', {
                                required: '비밀번호를 입력해주세요.',
                                minLength: { value: PASSWORD_MIN_LENGTH, message: `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상 입력해주세요.` },
                                validate: (v) => {
                                    if (!/.*[0-9].*/.test(v)) return '비밀번호에 숫자를 포함해주세요.';
                                    if (!/.*[a-zA-Z].*/.test(v)) return '비밀번호에 영문을 포함해주세요.';
                                    return true;
                                },
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
                            placeholder="위에서 입력한 비밀번호를 다시 입력"
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

                <div className={styles.fieldGroup}>
                    <label htmlFor="name" className={styles.label}>
                        이름
                    </label>
                    <div className={styles.inputWrapper}>
                        <UserCircle className={styles.inputIcon} />
                        <input
                            id="name"
                            type="text"
                            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                            placeholder="실명 입력 (예: 홍길동)"
                            autoComplete="name"
                            {...register('name', {
                                required: '이름을 입력해주세요.',
                            })}
                        />
                    </div>
                    {errors.name && (
                        <span className={styles.fieldError}>{errors.name.message}</span>
                    )}
                </div>

                <div className={styles.fieldGroup}>
                    <label htmlFor="email" className={styles.label}>
                        이메일
                    </label>
                    <div className={styles.inputWrapper}>
                        <Mail className={styles.inputIcon} />
                        <input
                            id="email"
                            type="email"
                            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                            placeholder="예: example@email.com (선택)"
                            autoComplete="email"
                            {...register('email', {
                                validate: (v) => {
                                    if (!v || !v.trim()) return true;
                                    return EMAIL_REGEX.test(v.trim()) || '올바른 이메일 형식을 입력해주세요.';
                                },
                            })}
                        />
                    </div>
                    {errors.email && (
                        <span className={styles.fieldError}>{errors.email.message}</span>
                    )}
                </div>

                <div className={styles.fieldGroup}>
                    <label htmlFor="birthDate" className={styles.label}>
                        생년월일
                    </label>
                    <div className={styles.inputWrapper}>
                        <Calendar className={styles.inputIcon} />
                        <input
                            id="birthDate"
                            type="date"
                            className={`${styles.input} ${errors.birthDate ? styles.inputError : ''}`}
                            {...register('birthDate')}
                        />
                    </div>
                    <span className={styles.fieldHint}>선택 항목입니다.</span>
                </div>

                <div className={styles.fieldGroup}>
                    <label htmlFor="phone" className={styles.label}>
                        핸드폰 번호
                    </label>
                    <div className={styles.inputWrapper}>
                        <Phone className={styles.inputIcon} />
                        <input
                            id="phone"
                            type="tel"
                            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                            placeholder="숫자만 또는 010-1234-5678 형식"
                            autoComplete="tel"
                            {...register('phone', {
                                required: '핸드폰 번호를 입력해주세요.',
                                validate: (v) => {
                                    const digits = (v || '').replace(/\D/g, '');
                                    return (digits.length >= 10 && digits.length <= 11 && digits.startsWith('01')) || '올바른 휴대폰 번호를 입력해주세요. (010으로 시작, 10~11자리)';
                                },
                            })}
                        />
                    </div>
                    {errors.phone && (
                        <span className={styles.fieldError}>{errors.phone.message}</span>
                    )}
                </div>

                <div className={styles.fieldGroup}>
                    <label htmlFor="displayNickname" className={styles.label}>
                        닉네임
                    </label>
                    <div className={styles.inputWrapper}>
                        <AtSign className={styles.inputIcon} />
                        <input
                            id="displayNickname"
                            type="text"
                            className={`${styles.input} ${errors.displayNickname ? styles.inputError : ''}`}
                            placeholder="영문, 한글, 숫자 2~20자 (예: 홍길동123)"
                            autoComplete="nickname"
                            {...register('displayNickname', {
                                required: '닉네임을 입력해주세요.',
                                minLength: { value: 2, message: '닉네임은 2자 이상 입력해주세요.' },
                                maxLength: { value: 20, message: '닉네임은 20자 이하로 입력해주세요.' },
                                pattern: {
                                    value: NICKNAME_REGEX,
                                    message: '닉네임은 영문, 한글, 숫자, _ 만 사용 가능합니다. (2~20자)',
                                },
                            })}
                        />
                    </div>
                    {errors.displayNickname && (
                        <span className={styles.fieldError}>{errors.displayNickname.message}</span>
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
