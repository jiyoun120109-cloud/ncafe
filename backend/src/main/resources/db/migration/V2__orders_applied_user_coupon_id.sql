-- orders 테이블에 applied_user_coupon_id 컬럼 추가 (결제 시 적용 쿠폰)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'applied_user_coupon_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN applied_user_coupon_id BIGINT;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
