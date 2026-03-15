-- orders.payment_id: 결제 준비(ready) 시 payments.id로 갱신. 주문 생성 시점에는 null 허용.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_id') THEN
    ALTER TABLE orders ADD COLUMN payment_id BIGINT;
  ELSE
    ALTER TABLE orders ALTER COLUMN payment_id DROP NOT NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
