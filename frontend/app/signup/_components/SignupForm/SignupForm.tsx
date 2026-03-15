'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, UserCircle, Phone, AtSign, Mail, Calendar, MapPin, X } from 'lucide-react';
import { signupApi, checkUsernameApi } from '@/services/authService';
import styles from './SignupForm.module.css';

const TERMS_OF_SERVICE = `제1조 (목적)
이 약관은 NCafe(이하 "서비스")가 제공하는 카페 예약·주문·회원 서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.

제2조 (정의)
① "서비스"란 NCafe가 제공하는 웹/앱 기반의 메뉴 조회, 주문, 결제, 회원 관리 등 일체의 서비스를 말합니다.
② "이용자"란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.
③ "회원"이란 서비스에 가입하여 회원으로 등록한 자를 말합니다.

제3조 (약관의 효력 및 변경)
① 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 공지함으로써 효력이 발생합니다.
② 서비스는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 변경된 약관은 제1항과 동일한 방법으로 공지합니다.
③ 이용자는 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.

제4조 (서비스의 제공)
① 서비스는 메뉴 조회, 온라인 주문, 결제, 회원 정보 관리, 문의·공지 등의 서비스를 제공합니다.
② 서비스는 운영상·기술상의 필요에 따라 제공 내용을 변경할 수 있으며, 이 경우 사전에 공지합니다.

제5조 (이용계약의 성립)
① 이용계약은 이용자가 약관 내용에 동의하고 가입 신청을 한 후, 서비스가 이를 승낙함으로써 성립합니다.
② 서비스는 다음 각 호에 해당하는 경우 가입을 거부할 수 있습니다.
  - 타인의 명의를 도용한 경우
  - 허위 정보를 기재한 경우
  - 기타 서비스가 정한 이용 요건을 충족하지 못한 경우

제6조 (회원의 의무)
회원은 서비스 이용 시 관계 법령 및 본 약관을 준수하여야 하며, 타인의 정보를 도용하거나 서비스를 부정한 방법으로 이용하여서는 안 됩니다.`;

const PRIVACY_POLICY = `1. 수집하는 개인정보 항목
서비스는 회원가입, 주문 처리, 문의 응대 등을 위해 아래와 같은 개인정보를 수집합니다.
• 필수 항목: 아이디, 비밀번호, 이름, 생년월일, 휴대전화번호, 이메일
• 선택 항목: 닉네임(표시명)
• 자동 수집 항목: 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보

2. 개인정보의 수집 및 이용 목적
• 회원 가입 및 관리: 본인 확인, 회원 자격 유지·관리
• 주문 및 결제 처리: 주문 접수, 결제·정산, 배달·픽업 안내
• 문의 및 고객 지원: 문의 접수, 불만 처리, 공지사항 전달
• 서비스 개선: 이용 패턴 분석, 서비스 품질 향상

3. 개인정보의 보유 및 이용 기간
• 회원 탈퇴 시까지 보유하며, 탈퇴 후에는 지체 없이 파기합니다. 단, 관계 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.
• 전자상거래 등에서의 소비자 보호에 관한 법률 등에 따라 거래 기록은 5년간 보관할 수 있습니다.

4. 개인정보의 제3자 제공
서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 법령에 의하거나 이용자가 사전에 동의한 경우에는 예외로 합니다.

5. 이용자의 권리
이용자는 언제든지 자신의 개인정보를 조회·수정·삭제·처리 정지를 요청할 수 있으며, 서비스는 이에 대해 지체 없이 조치합니다.

6. 개인정보 보호책임자
개인정보 처리와 관련한 문의는 서비스 내 고객센터 또는 공지된 담당자 연락처로 문의하시기 바랍니다.`;

interface SignupFormValues {
    username: string;
    password: string;
    passwordConfirm: string;
    name: string;
    birthDate: string;
    phone: string;
    address: string;
    addressDetail: string;
    displayNickname: string;
    email: string;
}

interface SignupFormProps {
    onError: (message: string) => void;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_MIN_LENGTH = 6;
const NICKNAME_REGEX = /^[a-zA-Z0-9가-힣_]{2,20}$/;

function isValidBirthDate(value: string): boolean {
    if (!value || value.length !== 8) return false;
    const y = parseInt(value.slice(0, 4), 10);
    const m = parseInt(value.slice(4, 6), 10);
    const d = parseInt(value.slice(6, 8), 10);
    if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1) return false;
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export default function SignupForm({ onError }: SignupFormProps) {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [usernameCheckStatus, setUsernameCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const [usernameCheckedValue, setUsernameCheckedValue] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [agreementModal, setAgreementModal] = useState<'terms' | 'privacy' | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        setError,
        clearErrors,
        formState: { errors },
    } = useForm<SignupFormValues>({ mode: 'onBlur', defaultValues: { addressDetail: '' } });

    const password = watch('password');
    const username = watch('username');

    const openAddressSearch = () => {
        type DaumPostcodeData = { userSelectedType: string; roadAddress: string; jibunAddress: string; buildingName?: string };
        const onComplete = (data: DaumPostcodeData) => {
            let full = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
            if (data.buildingName) full += ` ${data.buildingName}`;
            setValue('address', full);
        };
        if (typeof window !== 'undefined' && (window as unknown as { daum?: { Postcode: new (o: { oncomplete: (d: DaumPostcodeData) => void }) => { open: () => void } } }).daum?.Postcode) {
            new (window as unknown as { daum: { Postcode: new (o: { oncomplete: (d: DaumPostcodeData) => void }) => { open: () => void } } }).daum.Postcode({ oncomplete: onComplete }).open();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.async = true;
        script.onload = () => {
            const w = window as unknown as { daum?: { Postcode: new (o: { oncomplete: (d: DaumPostcodeData) => void }) => { open: () => void } } };
            if (w.daum?.Postcode) new w.daum.Postcode({ oncomplete: onComplete }).open();
        };
        document.body.appendChild(script);
    };

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
        if (!agreeTerms || !agreePrivacy) {
            onError('이용약관 및 개인정보 수집 동의에 모두 체크해주세요.');
            return;
        }

        setIsLoading(true);
        onError('');

        try {
            const birthDateVal = (data.birthDate || '').replace(/\D/g, '');
            const phoneVal = (data.phone || '').replace(/\D/g, '');
            const result = await signupApi({
                username: data.username.trim(),
                password: data.password,
                name: data.name.trim() || undefined,
                birthDate: birthDateVal.length === 8 ? `${birthDateVal.slice(0, 4)}-${birthDateVal.slice(4, 6)}-${birthDateVal.slice(6, 8)}` : undefined,
                phone: phoneVal || undefined,
                address: [data.address, data.addressDetail].map((s) => (s || '').trim()).filter(Boolean).join(' ') || undefined,
                displayNickname: (data.displayNickname || '').trim() || undefined,
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
                            type="text"
                            inputMode="numeric"
                            maxLength={8}
                            placeholder="예: 19880301 (8자리 숫자)"
                            className={`${styles.input} ${errors.birthDate ? styles.inputError : ''}`}
                            {...register('birthDate', {
                                validate: (v) => {
                                    if (!v || !v.trim()) return true;
                                    const digits = v.replace(/\D/g, '');
                                    if (digits.length !== 8) return '생년월일을 8자리 숫자로 입력해주세요. (예: 19880301)';
                                    return isValidBirthDate(digits) || '올바른 날짜를 입력해주세요.';
                                },
                                onChange: (e) => {
                                    const next = e.target.value.replace(/\D/g, '').slice(0, 8);
                                    e.target.value = next;
                                },
                            })}
                        />
                    </div>
                    <span className={styles.fieldHint}>선택 항목입니다.</span>
                    {errors.birthDate && (
                        <span className={styles.fieldError}>{errors.birthDate.message}</span>
                    )}
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
                            inputMode="numeric"
                            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                            placeholder="예: 01039079055 (숫자만 10~11자리)"
                            autoComplete="tel"
                            {...register('phone', {
                                required: '핸드폰 번호를 입력해주세요.',
                                validate: (v) => {
                                    const digits = (v || '').replace(/\D/g, '');
                                    return (digits.length >= 10 && digits.length <= 11 && digits.startsWith('01')) || '올바른 휴대폰 번호를 입력해주세요. (010으로 시작, 10~11자리 숫자)';
                                },
                                onChange: (e) => {
                                    const next = e.target.value.replace(/\D/g, '').slice(0, 11);
                                    e.target.value = next;
                                },
                            })}
                        />
                    </div>
                    {errors.phone && (
                        <span className={styles.fieldError}>{errors.phone.message}</span>
                    )}
                </div>

                <div className={styles.fieldGroup}>
                    <label htmlFor="address" className={styles.label}>
                        주소 <span className={styles.optional}>(선택)</span>
                    </label>
                    <div className={styles.addressRow}>
                        <div className={styles.inputWrapper}>
                            <MapPin className={styles.inputIcon} />
                            <input
                                id="address"
                                type="text"
                                className={`${styles.input} ${errors.address ? styles.inputError : ''}`}
                                placeholder="주소 검색 버튼으로 검색 후 선택하면 여기에 입력됩니다"
                                autoComplete="street-address"
                                {...register('address')}
                            />
                        </div>
                        <button type="button" className={styles.addressSearchBtn} onClick={openAddressSearch}>
                            주소 검색
                        </button>
                    </div>
                    <input
                        id="addressDetail"
                        type="text"
                        className={`${styles.input} ${styles.addressDetailInput} ${errors.addressDetail ? styles.inputError : ''}`}
                        placeholder="상세주소 (동, 호수 등)"
                        autoComplete="address-line2"
                        {...register('addressDetail')}
                    />
                    {errors.address && (
                        <span className={styles.fieldError}>{errors.address.message}</span>
                    )}
                </div>

                <div className={styles.fieldGroup}>
                    <label htmlFor="displayNickname" className={styles.label}>
                        닉네임 <span className={styles.optional}>(선택)</span>
                    </label>
                    <div className={styles.inputWrapper}>
                        <AtSign className={styles.inputIcon} />
                        <input
                            id="displayNickname"
                            type="text"
                            className={`${styles.input} ${errors.displayNickname ? styles.inputError : ''}`}
                            placeholder="미입력 시 아이디가 표시됩니다"
                            autoComplete="nickname"
                            {...register('displayNickname', {
                                validate: (v) => {
                                    if (!v || !v.trim()) return true;
                                    if (v.trim().length < 2) return '닉네임은 2자 이상 입력해주세요.';
                                    if (v.trim().length > 20) return '닉네임은 20자 이하로 입력해주세요.';
                                    return NICKNAME_REGEX.test(v.trim()) || '닉네임은 영문, 한글, 숫자, _ 만 사용 가능합니다. (2~20자)';
                                },
                            })}
                        />
                    </div>
                    {errors.displayNickname && (
                        <span className={styles.fieldError}>{errors.displayNickname.message}</span>
                    )}
                </div>

                <div className={styles.agreement}>
                    <label className={styles.agreementLabel}>
                        <input
                            type="checkbox"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            className={styles.agreementCheckbox}
                        />
                        <span>
                            <button
                                type="button"
                                className={styles.agreementLink}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAgreementModal('terms'); }}
                            >
                                이용약관
                            </button>
                            에 동의합니다 (필수)
                        </span>
                    </label>
                    <label className={styles.agreementLabel}>
                        <input
                            type="checkbox"
                            checked={agreePrivacy}
                            onChange={(e) => setAgreePrivacy(e.target.checked)}
                            className={styles.agreementCheckbox}
                        />
                        <span>
                            <button
                                type="button"
                                className={styles.agreementLink}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAgreementModal('privacy'); }}
                            >
                                개인정보 수집 및 이용
                            </button>
                            에 동의합니다 (필수)
                        </span>
                    </label>
                </div>

                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isLoading || !agreeTerms || !agreePrivacy}
                >
                    {isLoading ? (
                        <span className={styles.spinner} />
                    ) : (
                        <span className={styles.buttonText}>회원가입</span>
                    )}
                </button>
            </form>

            {agreementModal && (
                <div className={styles.agreementModalOverlay} onClick={() => setAgreementModal(null)} role="dialog" aria-modal="true" aria-labelledby="agreement-modal-title">
                    <div className={styles.agreementModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.agreementModalHeader}>
                            <h2 id="agreement-modal-title" className={styles.agreementModalTitle}>
                                {agreementModal === 'terms' ? '이용약관' : '개인정보 수집 및 이용동의서'}
                            </h2>
                            <button type="button" className={styles.agreementModalClose} onClick={() => setAgreementModal(null)} aria-label="닫기">
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.agreementModalBody}>
                            <pre className={styles.agreementModalText}>
                                {agreementModal === 'terms' ? TERMS_OF_SERVICE : PRIVACY_POLICY}
                            </pre>
                        </div>
                        <div className={styles.agreementModalFooter}>
                            <button type="button" className={styles.agreementModalConfirm} onClick={() => setAgreementModal(null)}>
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.footer}>
                <span>이미 계정이 있으신가요?</span>
                <Link href="/login" className={styles.footerLink}>
                    로그인
                </Link>
            </div>
        </>
    );
}
