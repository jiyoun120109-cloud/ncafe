'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { Menu, MenuCategory } from '@/types/menu';
import { Plus, Trash2, Image as ImageIcon, X, Upload } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import styles from './MenuForm.module.css';

interface MenuFormProps {
    initialData?: Partial<Menu>;
    categories: MenuCategory[];
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export default function MenuForm({ initialData, categories, onSubmit, onCancel }: MenuFormProps) {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            korName: initialData?.korName || '',
            engName: initialData?.engName || '',
            price: initialData?.price || 0,
            description: initialData?.description || '',
            category: initialData?.category || categories[0]?.id || '',
            isSoldOut: initialData?.isSoldOut || false,
            options: initialData?.options || [],
        },
    });

    const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
        control,
        name: 'options',
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {/* Basic Info Section */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>기본 정보</h2>
                <div className={styles.grid}>
                    <Input
                        label="메뉴명 (한글) *"
                        {...register('korName', { required: '한글 메뉴명은 필수입니다.' })}
                        placeholder="예: 아메리카노"
                        error={errors.korName?.message as string}
                        fullWidth
                    />

                    <Input
                        label="메뉴명 (영문) *"
                        {...register('engName', { required: '영문 메뉴명은 필수입니다.' })}
                        placeholder="예: Americano"
                        error={errors.engName?.message as string}
                        fullWidth
                    />

                    <Input
                        label="가격 (원) *"
                        type="number"
                        {...register('price', { required: '가격은 필수입니다.', min: 0 })}
                        placeholder="0"
                        error={errors.price ? '가격을 정확히 입력해주세요.' : undefined}
                        fullWidth
                    />

                    <div className={styles.field}>
                        <label className={styles.label}>카테고리 *</label>
                        <select
                            {...register('category')}
                            className={styles.select}
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.korName}</option>
                            ))}
                        </select>
                    </div>

                    <div className={`${styles.field} ${styles.fullWidth}`}>
                        <label className={styles.label}>설명</label>
                        <textarea
                            {...register('description')}
                            placeholder="메뉴에 대한 설명을 입력하세요"
                            className={styles.textarea}
                            rows={3}
                        />
                    </div>
                </div>
            </section>

            {/* Image Upload Section (Prototype UI) */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>이미지 등록</h2>
                <div className={styles.imageUploadGrid}>
                    <div className={styles.uploadBox}>
                        <Upload size={24} />
                        <span>이미지 업로드</span>
                        <p>드래그하거나 클릭하세요</p>
                    </div>
                    {/* Placeholder for uploaded images */}
                    <div className={styles.imagePreview}>
                        <ImageIcon size={32} />
                        <span className={styles.badge}>대표</span>
                        <button type="button" className={styles.removeImg}><X size={14} /></button>
                    </div>
                </div>
            </section>

            {/* Options Section */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>옵션 관리</h2>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => appendOption({ id: Date.now().toString(), name: '', type: 'radio', required: false, items: [] })}
                        leftIcon={<Plus size={16} />}
                    >
                        옵션 추가
                    </Button>
                </div>

                <div className={styles.optionList}>
                    {optionFields.map((field, index) => (
                        <div key={field.id} className={styles.optionItem}>
                            <div className={styles.optionRow}>
                                <Input
                                    {...register(`options.${index}.name` as const)}
                                    placeholder="옵션명 (예: 사이즈, 샷 추가)"
                                    fullWidth
                                />
                                <select {...register(`options.${index}.type` as const)} className={styles.select}>
                                    <option value="radio">단일 선택</option>
                                    <option value="checkbox">다중 선택</option>
                                </select>
                                <label className={styles.checkboxLabel}>
                                    <input type="checkbox" {...register(`options.${index}.required` as const)} />
                                    필수
                                </label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOption(index)}
                                    className={styles.deleteBtn}
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {optionFields.length === 0 && (
                        <p className={styles.emptyText}>추가된 옵션이 없습니다.</p>
                    )}
                </div>
            </section>

            {/* Status Section */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>판매 설정</h2>
                <div className={styles.statusBox}>
                    <label className={styles.statusLabel}>
                        <input type="checkbox" {...register('isSoldOut')} />
                        이 메뉴를 품절 상태로 등록합니다.
                    </label>
                </div>
            </section>

            {/* Form Actions */}
            <div className={styles.actions}>
                <Button type="button" variant="outline" onClick={onCancel}>취소</Button>
                <Button type="submit" variant="primary">
                    {initialData ? '정보 수정하기' : '새 메뉴 등록하기'}
                </Button>
            </div>
        </form>
    );
}
