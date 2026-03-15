-- 회원 주소 컬럼 추가
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'address') THEN
        ALTER TABLE users ADD COLUMN address VARCHAR(500);
    END IF;
END $$;
