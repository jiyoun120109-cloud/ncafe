export const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
    }).format(price);
};

const KOREA_TZ = 'Asia/Seoul';

export const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ko-KR', {
        timeZone: KOREA_TZ,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString('ko-KR', {
        timeZone: KOREA_TZ,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};
