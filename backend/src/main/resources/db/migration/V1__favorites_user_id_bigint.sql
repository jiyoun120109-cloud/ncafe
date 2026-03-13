-- 배포 DB: favorites.user_id가 UUID면 DROP 후 재생성 (Hibernate validate가 data.sql보다 먼저 실행되므로 Flyway로 선행 실행)
DO $$
DECLARE
  col_type text;
  users_exists boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') INTO users_exists;
  IF NOT users_exists THEN
    RETURN;
  END IF;

  SELECT data_type INTO col_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'favorites' AND column_name = 'user_id';
  IF col_type = 'uuid' THEN
    DROP TABLE IF EXISTS favorites CASCADE;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- users 테이블이 있을 때만 favorites 생성 (신규 DB는 data.sql에서 생성)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    CREATE TABLE IF NOT EXISTS favorites (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        menu_id BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, menu_id)
    );
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
