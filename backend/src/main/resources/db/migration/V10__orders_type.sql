-- 배포 DB에 orders.type 컬럼이 NOT NULL로 있는 경우 대응. 앱에서 저장 시 PICK_UP 등 설정.
-- (일부 배포 DB는 type CHECK(DINE_IN|PICK_UP|DELIVERY) 있음 → GENERAL 불가)
-- 컬럼이 없으면 추가 (NOT NULL DEFAULT 'PICK_UP'). 이미 있으면 기존 NULL에 기본값 채움.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'type') THEN
    ALTER TABLE orders ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'PICK_UP';
  ELSE
    UPDATE orders SET type = 'PICK_UP' WHERE type IS NULL;
    ALTER TABLE orders ALTER COLUMN type SET DEFAULT 'PICK_UP';
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
