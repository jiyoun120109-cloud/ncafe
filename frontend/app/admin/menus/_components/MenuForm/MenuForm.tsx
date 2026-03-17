'use client';

import { useState, useRef } from 'react';
import { useForm, useFieldArray, Control } from 'react-hook-form';
import { Menu, MenuCategory, ProductInfo } from '@/types/menu';
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

const emptyNut = () => ({
    sodiumMg: undefined as number | undefined,
    carbsG: undefined as number | undefined,
    sugarsG: undefined as number | undefined,
    fatG: undefined as number | undefined,
    transFatG: undefined as number | undefined,
    saturatedFatG: undefined as number | undefined,
    cholesterolMg: undefined as number | undefined,
    proteinG: undefined as number | undefined,
});

const emptyProductInfo = (): ProductInfo & { allergensStr?: string } => ({
    weightG: undefined,
    calorieKcal: undefined,
    nutrition: emptyNut(),
    allergens: [],
    allergensStr: '',
    storage: '',
});

function productInfoFromInitial(p?: ProductInfo | null): ProductInfo & { allergensStr?: string } {
    if (!p) return emptyProductInfo();
    const nut = p.nutrition ?? {};
    return {
        weightG: p.weightG,
        calorieKcal: p.calorieKcal,
        nutrition: {
            sodiumMg: nut.sodiumMg,
            carbsG: nut.carbsG,
            sugarsG: nut.sugarsG,
            fatG: nut.fatG,
            transFatG: nut.transFatG,
            saturatedFatG: nut.saturatedFatG,
            cholesterolMg: nut.cholesterolMg,
            proteinG: nut.proteinG,
        },
        allergens: p.allergens ?? [],
        allergensStr: Array.isArray(p.allergens) ? p.allergens.join(', ') : '',
        storage: p.storage ?? '',
    };
}

/** 옵션별 항목(예: 레귤러 +0원) 리스트 - options[index].items */
function OptionItemList({
    control,
    optionIndex,
}: {
    control: Control<any>;
    optionIndex: number;
}) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `options.${optionIndex}.items`,
    });
    return (
        <div className={styles.optionItemList}>
            {fields.map((item, idx) => (
                <div key={item.id} className={styles.optionItemRow}>
                    <input
                        className={styles.input}
                        {...control.register(`options.${optionIndex}.items.${idx}.name` as const)}
                        placeholder="항목명 (예: 레귤러)"
                    />
                    <input
                        type="number"
                        className={styles.input}
                        {...control.register(`options.${optionIndex}.items.${idx}.priceDelta` as const, {
                            valueAsNumber: true,
                            setValueAs: (v) => (v === '' || v == null ? 0 : Number(v)),
                        })}
                        placeholder="가격 추가"
                    />
                    <span className={styles.optionItemUnit}>원</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(idx)} className={styles.deleteBtn}>
                        <Trash2 size={14} />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="ghost" size="sm" onClick={() => append({ name: '', priceDelta: 0 })} leftIcon={<Plus size={14} />}>
                항목 추가
            </Button>
        </div>
    );
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
            isPopular: (initialData as any)?.isPopular ?? false,
            isNew: (initialData as any)?.isNew ?? false,
            isRecommended: (initialData as any)?.isRecommended ?? false,
            displayPriority: (initialData as any)?.displayPriority ?? 0,
            likeCount: (initialData as any)?.likeCount ?? 0,
            viewCount: (initialData as any)?.viewCount ?? 0,
            options: initialData?.options?.length
                ? initialData.options.map((o) => ({
                      ...o,
                      items: o.items?.length ? o.items : [],
                  }))
                : [],
            productInfo: productInfoFromInitial(initialData?.productInfo),
        },
    });

    const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
        control,
        name: 'options',
    });
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (files.length === 0) return;
        const maxAdd = 10 - imageFiles.length;
        if (maxAdd <= 0) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        const toAdd = files.slice(0, maxAdd);
        Promise.all(
            toAdd.map((file) => new Promise<string>((res) => {
                const r = new FileReader();
                r.onload = () => res(r.result as string);
                r.readAsDataURL(file);
            }))
        ).then((urls) => {
            setImageFiles((prev) => [...prev, ...toAdd].slice(0, 10));
            setImagePreviews((prev) => [...prev, ...urls].slice(0, 10));
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImageAt = (index: number) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const num = (v: unknown): number | undefined => {
        if (v == null || v === '') return undefined;
        const n = Number(v);
        return Number.isNaN(n) ? undefined : n;
    };

    const handleFormSubmit = (data: any) => {
        const pi = data.productInfo as (ProductInfo & { allergensStr?: string }) | undefined;
        const allergensStr = pi?.allergensStr ?? '';
        const allergens = typeof allergensStr === 'string'
            ? allergensStr.split(/[,，\s]+/).map((s: string) => s.trim()).filter(Boolean)
            : (pi?.allergens ?? []);
        let productInfoJson: string | undefined;
        if (pi) {
            const nutrition = pi.nutrition
                ? {
                    sodiumMg: num(pi.nutrition.sodiumMg),
                    carbsG: num(pi.nutrition.carbsG),
                    sugarsG: num(pi.nutrition.sugarsG),
                    fatG: num(pi.nutrition.fatG),
                    transFatG: num(pi.nutrition.transFatG),
                    saturatedFatG: num(pi.nutrition.saturatedFatG),
                    cholesterolMg: num(pi.nutrition.cholesterolMg),
                    proteinG: num(pi.nutrition.proteinG),
                }
                : undefined;
            const cleaned: ProductInfo = {
                weightG: num(pi.weightG),
                calorieKcal: num(pi.calorieKcal),
                nutrition: nutrition && Object.values(nutrition).some((v) => v != null) ? nutrition : undefined,
                allergens: allergens.length ? allergens : undefined,
                storage: pi.storage?.trim() || undefined,
            };
            const hasAny =
                cleaned.weightG != null ||
                cleaned.calorieKcal != null ||
                (cleaned.nutrition && Object.values(cleaned.nutrition).some((v) => v != null)) ||
                (cleaned.allergens?.length) ||
                cleaned.storage;
            productInfoJson = hasAny ? JSON.stringify(cleaned) : undefined;
        }
        const optionsForJson = Array.isArray(data.options)
            ? data.options.map((o: { name?: string; type?: string; required?: boolean; items?: { name?: string; priceDelta?: number }[] }) => ({
                  name: o.name ?? '',
                  type: o.type === 'checkbox' ? 'checkbox' : 'radio',
                  required: Boolean(o.required),
                  items: (o.items ?? []).map((it) => ({ name: it.name ?? '', priceDelta: Number(it.priceDelta) || 0 })),
              }))
            : [];
        const optionsJson = optionsForJson.length ? JSON.stringify(optionsForJson) : undefined;
        onSubmit({
            ...data,
            imageFiles: imageFiles.length > 0 ? imageFiles : undefined,
            productInfoJson,
            optionsJson,
            options: data.options,
            isPopular: Boolean(data.isPopular),
            isNew: Boolean(data.isNew),
            isRecommended: Boolean(data.isRecommended),
            displayPriority: num(data.displayPriority) ?? 0,
        });
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
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
                        {...register('price', {
                            setValueAs: (v) => (v === '' || v == null ? NaN : Number(v)),
                            validate: (v) => {
                                if (v === undefined || v === null || (typeof v === 'number' && Number.isNaN(v))) return '가격은 필수입니다.';
                                const n = Number(v);
                                if (!Number.isFinite(n)) return '가격에는 숫자를 입력해주세요.';
                                if (n < 0) return '가격은 0원 이상이어야 합니다.';
                                if (n > 99999999) return '가격은 99,999,999원 이하여야 합니다.';
                                if (!Number.isInteger(n)) return '가격은 정수로 입력해주세요.';
                                return true;
                            },
                        })}
                        placeholder="0"
                        error={errors.price?.message as string}
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

            {/* Image Upload Section — 여러 장 등록 가능, 상세에서 대표 선택 */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>이미지 등록 (최대 10장)</h2>
                <div className={styles.imageUploadGrid}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className={styles.fileInput}
                        aria-label="이미지 선택"
                    />
                    <div
                        className={styles.uploadBox}
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                    >
                        <Upload size={24} />
                        <span>이미지 추가</span>
                        <p>여러 장 선택 가능</p>
                    </div>
                    {imagePreviews.map((src, index) => (
                        <div key={index} className={styles.imagePreview}>
                            <img src={src} alt={`미리보기 ${index + 1}`} className={styles.previewImg} />
                            <span className={styles.badge}>{index === 0 ? '1번=대표' : index + 1}</span>
                            <button
                                type="button"
                                className={styles.removeImg}
                                onClick={() => removeImageAt(index)}
                                aria-label={`이미지 ${index + 1} 제거`}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    {imagePreviews.length === 0 && (
                        <div className={styles.imagePreviewPlaceholder}>
                            <ImageIcon size={32} />
                            <span>선택된 이미지 없음</span>
                        </div>
                    )}
                </div>
            </section>

            {/* Badge & Display Section */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>노출·배지</h2>
                <div className={styles.badgeGrid}>
                    <label className={styles.checkboxLabel}>
                        <input type="checkbox" {...register('isPopular')} />
                        인기
                    </label>
                    <label className={styles.checkboxLabel}>
                        <input type="checkbox" {...register('isNew')} />
                        NEW
                    </label>
                    <label className={styles.checkboxLabel}>
                        <input type="checkbox" {...register('isRecommended')} />
                        추천
                    </label>
                </div>
                <div className={styles.grid}>
                    <Input
                        label="노출 우선순위 (숫자 작을수록 앞)"
                        type="number"
                        {...register('displayPriority', { setValueAs: (v) => (v === '' || v == null ? 0 : Number(v)) })}
                        placeholder="0"
                        fullWidth
                    />
                    <div className={styles.likeViewRow}>
                        <div className={styles.field}>
                            <span className={styles.label}>좋아요</span>
                            <p className={styles.readOnlyValue} aria-live="polite">
                                {(initialData as any)?.likeCount ?? 0}명
                            </p>
                            <p className={styles.readOnlyHint}>찜한 회원 수</p>
                        </div>
                        <div className={styles.field}>
                            <span className={styles.label}>조회수</span>
                            <p className={styles.readOnlyValue} aria-live="polite">
                                {(initialData as any)?.viewCount ?? 0}회
                            </p>
                            <p className={styles.readOnlyHint}>상세 조회 시 집계 (방문자 수 이하)</p>
                        </div>
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
                        onClick={() => appendOption({ id: Date.now(), name: '', type: 'radio', required: false, items: [] })}
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
                                    placeholder="옵션명 (예: 온도, 사이즈)"
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
                            <OptionItemList control={control} optionIndex={index} />
                        </div>
                    ))}
                    {optionFields.length === 0 && (
                        <p className={styles.emptyText}>추가된 옵션이 없습니다.</p>
                    )}
                </div>
            </section>

            {/* Product Info (상품 정보 제공 고시) */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>제품 정보 (상품 정보 제공 고시)</h2>
                <div className={styles.grid}>
                    <Input
                        label="내용량 (g)"
                        type="number"
                        {...register('productInfo.weightG', { setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)) })}
                        placeholder="예: 360"
                        fullWidth
                    />
                    <Input
                        label="열량 (kcal)"
                        type="number"
                        {...register('productInfo.calorieKcal', {
                            setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
                            validate: (v) => {
                                if (v === undefined || v === null || (typeof v === 'number' && Number.isNaN(v))) return true;
                                const n = Number(v);
                                if (!Number.isFinite(n)) return '열량에는 숫자를 입력해주세요.';
                                if (n < 0) return '열량은 0 이상이어야 합니다.';
                                if (n > 10000) return '열량은 10,000 kcal 이하여야 합니다.';
                                return true;
                            },
                        })}
                        placeholder="예: 180"
                        error={errors.productInfo?.calorieKcal?.message as string}
                        fullWidth
                    />
                </div>
                <div className={styles.nutritionSubGrid}>
                    <p className={styles.nutritionLabel}>영양정보 (1회 제공량 기준)</p>
                    <Input label="나트륨 (mg)" type="number" {...register('productInfo.nutrition.sodiumMg', { setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)) })} placeholder="0" fullWidth />
                    <Input label="탄수화물 (g)" type="number" {...register('productInfo.nutrition.carbsG', { setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)) })} placeholder="0" fullWidth />
                    <Input label="당류 (g)" type="number" {...register('productInfo.nutrition.sugarsG', { setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)) })} placeholder="0" fullWidth />
                    <Input label="지방 (g)" type="number" {...register('productInfo.nutrition.fatG', { setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)) })} placeholder="0" fullWidth />
                    <Input label="트랜스지방 (g)" type="number" {...register('productInfo.nutrition.transFatG', { setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)) })} placeholder="0" fullWidth />
                    <Input label="포화지방 (g)" type="number" {...register('productInfo.nutrition.saturatedFatG', { setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)) })} placeholder="0" fullWidth />
                    <Input label="콜레스테롤 (mg)" type="number" {...register('productInfo.nutrition.cholesterolMg', { setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)) })} placeholder="0" fullWidth />
                    <Input label="단백질 (g)" type="number" {...register('productInfo.nutrition.proteinG', { setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)) })} placeholder="0" fullWidth />
                </div>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                    <label className={styles.label}>알레르기 유발 물질 (쉼표로 구분)</label>
                    <input
                        className={styles.input}
                        {...register('productInfo.allergensStr')}
                        placeholder="예: 우유, 대두, 밀, 달걀"
                    />
                </div>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                    <label className={styles.label}>보관방법</label>
                    <input
                        className={styles.input}
                        {...register('productInfo.storage')}
                        placeholder="예: 냉장보관(0~10℃), 상온보관"
                    />
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
