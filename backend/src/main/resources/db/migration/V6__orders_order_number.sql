-- orders.order_number: 노출용 주문 번호 (예: ORD-20260315135256-1234). 앱에서 저장 시 설정.
-- 컬럼이 없으면 추가 (nullable). 배포 DB에 이미 NOT NULL로 있으면 앱에서 항상 값 설정함.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'order_number') THEN
    ALTER TABLE orders ADD COLUMN order_number VARCHAR(64);
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
