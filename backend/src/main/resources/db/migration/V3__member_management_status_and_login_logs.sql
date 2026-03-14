-- 회원 관리 확장: 계정 상태, 로그인 추적, 로그인 로그 테이블

-- users 테이블에 status 컬럼 추가 (ACTIVE, INACTIVE, SUSPENDED, WITHDRAWN)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'status'
  ) THEN
    ALTER TABLE users ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 기존 행이 NULL이면 ACTIVE로 채우기
UPDATE users SET status = 'ACTIVE' WHERE status IS NULL;

-- users.last_login_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- users.password_changed_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password_changed_at'
  ) THEN
    ALTER TABLE users ADD COLUMN password_changed_at TIMESTAMP;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- users.locked_until (계정 잠금 해제 시각)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'locked_until'
  ) THEN
    ALTER TABLE users ADD COLUMN locked_until TIMESTAMP;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- users.login_fail_count
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'login_fail_count'
  ) THEN
    ALTER TABLE users ADD COLUMN login_fail_count INT NOT NULL DEFAULT 0;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- login_logs 테이블 (로그인 성공/실패 기록)
CREATE TABLE IF NOT EXISTS login_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    nickname VARCHAR(255),
    success BOOLEAN NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_created_at ON login_logs(created_at);
