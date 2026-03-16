-- 카테고리 description 컬럼 제거 (미사용)
ALTER TABLE categories DROP COLUMN IF EXISTS description;
