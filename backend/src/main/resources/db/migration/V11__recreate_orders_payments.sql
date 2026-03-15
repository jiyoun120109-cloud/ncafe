-- 기존 주문·결제 테이블 삭제 후 엔티티/모델/data.sql과 동일한 스키마로 재생성
-- (배포 환경에서 order_item_options 등 의존 테이블이 있으면 CASCADE로 함께 제거)

DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(64),
    user_id BIGINT,
    customer_id BIGINT,
    guest_email VARCHAR(255),
    guest_phone VARCHAR(50),
    type VARCHAR(50) NOT NULL DEFAULT 'PICK_UP',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    total_amount INT NOT NULL DEFAULT 0,
    total_price INT,
    applied_user_coupon_id BIGINT,
    payment_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_id BIGINT NOT NULL,
    menu_name VARCHAR(255),
    quantity INT NOT NULL DEFAULT 1,
    unit_price INT NOT NULL DEFAULT 0,
    option_extra_price INT DEFAULT 0,
    options_display VARCHAR(255)
);

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    method VARCHAR(30) NOT NULL DEFAULT 'KAKAOPAY',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    pg_tid VARCHAR(255),
    amount INT NOT NULL DEFAULT 0,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
