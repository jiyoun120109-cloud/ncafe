-- orders.total_price: 배포 DB에 NOT NULL로 있으면 앱에서 total_amount와 동일 값 저장.
-- 컬럼이 없으면 추가 (total_amount 값으로 채움).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'total_price') THEN
    ALTER TABLE orders ADD COLUMN total_price INT;
    UPDATE orders SET total_price = total_amount WHERE total_price IS NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
