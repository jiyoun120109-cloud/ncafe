-- 배포 DB에 orders.payment_id가 VARCHAR로 되어 있으면 BIGINT로 변경 (엔티티 Long 매핑과 일치)
DO $$
DECLARE
  col_type text;
BEGIN
  SELECT data_type INTO col_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_id';
  IF col_type = 'character varying' OR col_type = 'varchar' THEN
    ALTER TABLE orders ALTER COLUMN payment_id TYPE BIGINT USING NULLIF(TRIM(payment_id), '')::BIGINT;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
