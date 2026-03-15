-- 배포 DB에 orders.customer_id가 NOT NULL로 되어 있으면 nullable로 변경 (비회원 주문 허용)
-- 컬럼이 없으면 nullable로 추가 (코드에서 user_id와 동일 값 사용)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'customer_id') THEN
    ALTER TABLE orders ADD COLUMN customer_id BIGINT;
  ELSE
    ALTER TABLE orders ALTER COLUMN customer_id DROP NOT NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
