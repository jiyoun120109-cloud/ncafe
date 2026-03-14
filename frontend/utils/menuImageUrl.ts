/**
 * 메뉴 이미지 URL을 프론트 표시용 경로로 변환.
 * - 빈 값 → /images/missing
 * - http(s) URL → 확장자 검사 후 그대로 반환 또는 /images/missing
 * - 상대/파일명 → /images/{filename} (BFF /images/* 가 백엔드 static으로 프록시)
 */
export function menuImageUrl(url: string | null | undefined): string {
  if (!url?.trim()) return '/images/missing';
  if (url.startsWith('http')) {
    try {
      const path = new URL(url).pathname;
      const hasImageExt = /\.(png|jpe?g|gif|webp|svg|ico)(\?|$)/i.test(path);
      if (!hasImageExt) return '/images/missing';
    } catch {
      return '/images/missing';
    }
    return url;
  }
  const filename = url.replace(/^.*\//, '').trim();
  return `/images/${filename || 'missing'}`;
}

/** URL이 이미지로 쓸 수 있는지 검사 (http일 때 확장자, 그 외 true) */
export function isValidMenuImageUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  if (url.startsWith('http')) {
    try {
      const path = new URL(url).pathname;
      return /\.(png|jpe?g|gif|webp|svg|ico)(\?|$)/i.test(path);
    } catch {
      return false;
    }
  }
  return true;
}
