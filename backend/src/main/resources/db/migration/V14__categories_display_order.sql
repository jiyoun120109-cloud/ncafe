-- 카테고리 노출 순서 컬럼 추가 (DnD 순서 저장)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'display_order') THEN
        ALTER TABLE categories ADD COLUMN display_order INT;
        UPDATE categories SET display_order = id::int WHERE display_order IS NULL;
    END IF;
END $$;
