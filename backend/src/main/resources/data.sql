-- 사용자 테이블 (없으면 생성) — 비밀번호는 BCrypt 해시
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    nickname VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- nickname 유일 제약 추가 (이미 있으면 무시)
DO $$
BEGIN
    ALTER TABLE users ADD CONSTRAINT users_nickname_key UNIQUE (nickname);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 사용자 시드: admin(비밀번호 admin123), hong/user(비밀번호 1234) — BCrypt. ON CONFLICT로 매번 비밀번호 갱신.
INSERT INTO users (nickname, password, role, created_at, updated_at)
VALUES ('admin', '$2b$10$PuCgAovNP0kXGhAhx/9Y7.PE.EUt5XbkW09Eeyk7361ivsG/kseAq', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (nickname) DO UPDATE SET password = EXCLUDED.password, updated_at = CURRENT_TIMESTAMP;
INSERT INTO users (nickname, password, role, created_at, updated_at)
VALUES ('hong', '$2b$10$fLlRQKGL3BDlaYlrb7x3Eu7hYhxK1B/DYUV2UmWH8sgKg7GIy13V2', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (nickname) DO UPDATE SET password = EXCLUDED.password, updated_at = CURRENT_TIMESTAMP;
INSERT INTO users (nickname, password, role, created_at, updated_at)
VALUES ('user', '$2b$10$fLlRQKGL3BDlaYlrb7x3Eu7hYhxK1B/DYUV2UmWH8sgKg7GIy13V2', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (nickname) DO UPDATE SET password = EXCLUDED.password, updated_at = CURRENT_TIMESTAMP;

-- categories 테이블 (없으면 생성)
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    display_order INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- 시드 중복 방지: 카테고리/메뉴 시드 초기화 후 재삽입 (커피=1, 라떼=2, 베이커리=6)
TRUNCATE TABLE menus;
TRUNCATE TABLE categories RESTART IDENTITY CASCADE;

INSERT INTO categories (name, display_order, created_at, updated_at) VALUES
('커피', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('라떼', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('스무디', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('에이드', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('티', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('베이커리', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- menus 테이블 (없으면 생성) — 관리자/손님 공용
CREATE TABLE IF NOT EXISTS menus (
    id BIGSERIAL PRIMARY KEY,
    kor_name VARCHAR(255),
    eng_name VARCHAR(255),
    description TEXT,
    price INT,
    category_id BIGINT,
    is_available BOOLEAN,
    is_sold_out BOOLEAN,
    sort_order INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    options_json TEXT
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menus' AND column_name = 'options_json') THEN
        ALTER TABLE menus ADD COLUMN options_json TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menus' AND column_name = 'product_info_json') THEN
        ALTER TABLE menus ADD COLUMN product_info_json TEXT;
    END IF;
END $$;

-- 메뉴 삽입 (category_id: 1=커피, 2=라떼, 6=베이커리. 디테일 페이지 옵션(온도/원두/디카페인)은 커피(1)만 적용)
INSERT INTO menus (kor_name, eng_name, category_id, price, description, is_available, is_sold_out, sort_order, created_at, updated_at) VALUES
('아메리카노', 'Americano', 1, 4500, '진한 에스프레소의 맛', true, false, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('카페라떼', 'Cafe Latte', 1, 5000, '부드러운 우유의 라떼', true, false, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('카푸치노', 'Cappuccino', 1, 5500, '크리미한 거품감', true, false, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('카라멜 마끼아또', 'Caramel Macchiato', 1, 6500, '달콤한 카라멜', true, false, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('에스프레소', 'Espresso', 1, 4000, '진한 커피의 본연의 맛', true, false, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('시그니처 커피', 'Signature Coffee', 1, 7000, 'N Cafe만의 특별한 블렌딩', true, false, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('바나나 라떼', 'Banana Latte', 2, 6000, '달콤한 바나나와 우유', true, false, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('두바이 쫀득 쿠키', 'Dubai Zzondeuk Cookie', 6, 5500, '쫀득한 식감의 두바이 쿠키', true, false, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('초코칩 쿠키', 'Choco Chip Cookie', 6, 3500, '달콤한 초코칩이 콕콕', true, false, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('아몬드 쿠키', 'Almond Cookie', 6, 4000, '고소한 아몬드 쿠키', true, false, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('버터 쿠키', 'Butter Cookie', 6, 3000, '부드러운 버터향', true, false, 11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('딸기 케이크', 'Strawberry Cake', 6, 7500, '신선한 딸기가 가득한 케이크', true, false, 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('크림치즈 베이글', 'Bagel (Cream Cheese)', 6, 5500, '쫄깃한 베이글과 크림치즈', true, false, 13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('불고기 베이글', 'Beef Bagel', 6, 7000, '든든한 한 끼 불고기 베이글', true, false, 14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('햄치즈 샌드위치', 'Ham Cheese Sandwich', 6, 7000, '클래식한 햄치즈의 조화', true, false, 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('에그 스크램블 샌드위치', 'Scrambled Egg Sandwich', 6, 7500, '부드러운 에그 스크램블', true, false, 16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('참치 샌드위치', 'Tuna Sandwich', 6, 7500, '담백한 참치 마요', true, false, 17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('터키 샌드위치', 'Turkey Sandwich', 6, 8000, '고급스러운 터키 햄', true, false, 18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('초콜릿 크루아상', 'Chocolate Croissant', 6, 4500, '초콜릿 크루아상', true, false, 19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('초콜릿 무스', 'Chocolate Mousse', 6, 6500, '달콤한 초콜릿 무스', true, false, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 제품정보(영양정보·알레르기) 시드 (상품 정보 제공 고시 형식)
UPDATE menus SET product_info_json = '{"weightG":360,"calorieKcal":15,"nutrition":{"sodiumMg":5,"carbsG":0,"sugarsG":0,"fatG":0,"transFatG":0,"saturatedFatG":0,"cholesterolMg":0,"proteinG":0},"allergens":[],"storage":"상온보관"}' WHERE id = 1;
UPDATE menus SET product_info_json = '{"weightG":380,"calorieKcal":180,"nutrition":{"sodiumMg":80,"carbsG":18,"sugarsG":17,"fatG":7,"transFatG":0,"saturatedFatG":4,"cholesterolMg":25,"proteinG":10},"allergens":["우유"],"storage":"상온보관"}' WHERE id = 2;
UPDATE menus SET product_info_json = '{"weightG":360,"calorieKcal":120,"nutrition":{"sodiumMg":70,"carbsG":10,"sugarsG":9,"fatG":5,"transFatG":0,"saturatedFatG":3,"cholesterolMg":20,"proteinG":6},"allergens":["우유"],"storage":"상온보관"}' WHERE id = 3;
UPDATE menus SET product_info_json = '{"weightG":420,"calorieKcal":250,"nutrition":{"sodiumMg":120,"carbsG":32,"sugarsG":28,"fatG":10,"transFatG":0,"saturatedFatG":5,"cholesterolMg":30,"proteinG":8},"allergens":["우유"],"storage":"상온보관"}' WHERE id = 4;
UPDATE menus SET product_info_json = '{"weightG":30,"calorieKcal":5,"nutrition":{"sodiumMg":2,"carbsG":0,"sugarsG":0,"fatG":0,"transFatG":0,"saturatedFatG":0,"cholesterolMg":0,"proteinG":0},"allergens":[],"storage":"상온보관"}' WHERE id = 5;
UPDATE menus SET product_info_json = '{"weightG":400,"calorieKcal":35,"nutrition":{"sodiumMg":8,"carbsG":0,"sugarsG":0,"fatG":0,"transFatG":0,"saturatedFatG":0,"cholesterolMg":0,"proteinG":0},"allergens":[],"storage":"상온보관"}' WHERE id = 6;
UPDATE menus SET product_info_json = '{"weightG":400,"calorieKcal":280,"nutrition":{"sodiumMg":90,"carbsG":35,"sugarsG":30,"fatG":8,"transFatG":0,"saturatedFatG":4,"cholesterolMg":25,"proteinG":7},"allergens":["우유"],"storage":"상온보관"}' WHERE id = 7;
UPDATE menus SET product_info_json = '{"weightG":80,"calorieKcal":320,"nutrition":{"sodiumMg":180,"carbsG":42,"sugarsG":22,"fatG":14,"transFatG":0,"saturatedFatG":6,"cholesterolMg":45,"proteinG":5},"allergens":["밀","우유","달걀","대두"],"storage":"상온보관"}' WHERE id = 8;
UPDATE menus SET product_info_json = '{"weightG":50,"calorieKcal":240,"nutrition":{"sodiumMg":120,"carbsG":30,"sugarsG":18,"fatG":12,"transFatG":0,"saturatedFatG":5,"cholesterolMg":35,"proteinG":3},"allergens":["밀","우유","달걀","대두"],"storage":"상온보관"}' WHERE id = 9;
UPDATE menus SET product_info_json = '{"weightG":45,"calorieKcal":200,"nutrition":{"sodiumMg":100,"carbsG":24,"sugarsG":10,"fatG":10,"transFatG":0,"saturatedFatG":4,"cholesterolMg":30,"proteinG":4},"allergens":["밀","우유","달걀","아몬드"],"storage":"상온보관"}' WHERE id = 10;
UPDATE menus SET product_info_json = '{"weightG":40,"calorieKcal":150,"nutrition":{"sodiumMg":80,"carbsG":18,"sugarsG":8,"fatG":7,"transFatG":0,"saturatedFatG":3,"cholesterolMg":25,"proteinG":2},"allergens":["밀","우유","달걀"],"storage":"상온보관"}' WHERE id = 11;
UPDATE menus SET product_info_json = '{"weightG":120,"calorieKcal":380,"nutrition":{"sodiumMg":150,"carbsG":52,"sugarsG":32,"fatG":14,"transFatG":0,"saturatedFatG":6,"cholesterolMg":80,"proteinG":6},"allergens":["밀","우유","달걀","대두"],"storage":"냉장보관(0~10℃)"}' WHERE id = 12;
UPDATE menus SET product_info_json = '{"weightG":110,"calorieKcal":320,"nutrition":{"sodiumMg":380,"carbsG":48,"sugarsG":4,"fatG":8,"transFatG":0,"saturatedFatG":4,"cholesterolMg":25,"proteinG":12},"allergens":["밀","우유","대두"],"storage":"냉장보관(0~10℃)"}' WHERE id = 13;
UPDATE menus SET product_info_json = '{"weightG":195,"calorieKcal":420,"nutrition":{"sodiumMg":650,"carbsG":42,"sugarsG":5,"fatG":14,"transFatG":0,"saturatedFatG":5,"cholesterolMg":45,"proteinG":28},"allergens":["밀","쇠고기","우유","대두"],"storage":"냉장보관(0~10℃)"}' WHERE id = 14;
UPDATE menus SET product_info_json = '{"weightG":200,"calorieKcal":450,"nutrition":{"sodiumMg":1200,"carbsG":38,"sugarsG":6,"fatG":22,"transFatG":0,"saturatedFatG":8,"cholesterolMg":55,"proteinG":22},"allergens":["밀","돼지고기","우유","달걀","대두"],"storage":"냉장보관(0~10℃)"}' WHERE id = 15;
UPDATE menus SET product_info_json = '{"weightG":180,"calorieKcal":380,"nutrition":{"sodiumMg":520,"carbsG":28,"sugarsG":4,"fatG":20,"transFatG":0,"saturatedFatG":6,"cholesterolMg":320,"proteinG":18},"allergens":["밀","우유","달걀","대두"],"storage":"냉장보관(0~10℃)"}' WHERE id = 16;
UPDATE menus SET product_info_json = '{"weightG":190,"calorieKcal":420,"nutrition":{"sodiumMg":580,"carbsG":40,"sugarsG":8,"fatG":18,"transFatG":0,"saturatedFatG":4,"cholesterolMg":35,"proteinG":20},"allergens":["밀","우유","대두","땅콩","참치"],"storage":"냉장보관(0~10℃)"}' WHERE id = 17;
UPDATE menus SET product_info_json = '{"weightG":200,"calorieKcal":400,"nutrition":{"sodiumMg":950,"carbsG":36,"sugarsG":4,"fatG":16,"transFatG":0,"saturatedFatG":5,"cholesterolMg":60,"proteinG":26},"allergens":["밀","닭고기","우유","대두"],"storage":"냉장보관(0~10℃)"}' WHERE id = 18;
UPDATE menus SET product_info_json = '{"weightG":85,"calorieKcal":380,"nutrition":{"sodiumMg":220,"carbsG":38,"sugarsG":12,"fatG":22,"transFatG":0,"saturatedFatG":12,"cholesterolMg":45,"proteinG":6},"allergens":["밀","우유","달걀","대두"],"storage":"상온보관"}' WHERE id = 19;
UPDATE menus SET product_info_json = '{"weightG":120,"calorieKcal":320,"nutrition":{"sodiumMg":80,"carbsG":35,"sugarsG":28,"fatG":18,"transFatG":0,"saturatedFatG":10,"cholesterolMg":95,"proteinG":5},"allergens":["우유","달걀","대두"],"storage":"냉장보관(0~10℃)"}' WHERE id = 20;

-- 장바구니 (비회원: guest_session_id, 회원: user_id)
CREATE TABLE IF NOT EXISTS carts (
    id BIGSERIAL PRIMARY KEY,
    guest_session_id VARCHAR(255) UNIQUE,
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    menu_id BIGINT NOT NULL,
    menu_kor_name VARCHAR(255),
    menu_price INT,
    quantity INT NOT NULL DEFAULT 1,
    option_temperature VARCHAR(20),
    option_bean VARCHAR(100),
    option_decaf BOOLEAN DEFAULT FALSE,
    option_extra_price INT DEFAULT 0,
    options_display VARCHAR(255)
);

-- 기존 DB에 옵션 컬럼 추가 (이미 있으면 무시)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'option_temperature') THEN
        ALTER TABLE cart_items ADD COLUMN option_temperature VARCHAR(20);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'option_bean') THEN
        ALTER TABLE cart_items ADD COLUMN option_bean VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'option_decaf') THEN
        ALTER TABLE cart_items ADD COLUMN option_decaf BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'option_extra_price') THEN
        ALTER TABLE cart_items ADD COLUMN option_extra_price INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'options_display') THEN
        ALTER TABLE cart_items ADD COLUMN options_display VARCHAR(255);
    END IF;
END $$;

-- images 테이블 (없으면 생성)
CREATE TABLE IF NOT EXISTS images (
    id BIGSERIAL PRIMARY KEY,
    menu_id BIGINT,
    src_url VARCHAR(500),
    created_at TIMESTAMP,
    sort_order INT
);

-- 이미지 시드 중복 방지
TRUNCATE TABLE images;

-- 이미지 데이터 삽입
INSERT INTO images (menu_id, src_url, sort_order, created_at) VALUES
(1,  'americano.png',  1, CURRENT_TIMESTAMP),
(1,  'americano1.png', 2, CURRENT_TIMESTAMP),
(2,  'cafelatte.png',  1, CURRENT_TIMESTAMP),
(2,  'cafelatte1.png', 2, CURRENT_TIMESTAMP),
(3,  'capuchino.png',  1, CURRENT_TIMESTAMP),
(3,  'capuchino1.png', 2, CURRENT_TIMESTAMP),
(4,  'caramel-macchiato.png',  1, CURRENT_TIMESTAMP),
(4,  'caramel-macchiato1.png', 2, CURRENT_TIMESTAMP),
(4,  'caramelMacchiato.png',   3, CURRENT_TIMESTAMP),
(5,  'espresso.png',  1, CURRENT_TIMESTAMP),
(5,  'espresso1.png', 2, CURRENT_TIMESTAMP),
(6,  'signature.png',  1, CURRENT_TIMESTAMP),
(6,  'signature1.png', 2, CURRENT_TIMESTAMP),
(7,  'bananalatte.png',  1, CURRENT_TIMESTAMP),
(7,  'bananalatte1.png', 2, CURRENT_TIMESTAMP),
(8,  'DubaiZzondeukCookie.png',   1, CURRENT_TIMESTAMP),
(8,  'dubai-zzondeuk-cookie.png',  2, CURRENT_TIMESTAMP),
(8,  'dubai-zzondeuk-cookie1.png', 3, CURRENT_TIMESTAMP),
(9,  'choco-chip-cookie.png',  1, CURRENT_TIMESTAMP),
(9,  'choco-chip-cookie1.png', 2, CURRENT_TIMESTAMP),
(9,  'chocoChipCookie.png',    3, CURRENT_TIMESTAMP),
(10, 'almond-cookie.png',  1, CURRENT_TIMESTAMP),
(10, 'almond-cookie1.png', 2, CURRENT_TIMESTAMP),
(10, 'almondCookie.png',   3, CURRENT_TIMESTAMP),
(11, 'butter-cookie.png',  1, CURRENT_TIMESTAMP),
(11, 'butter-cookie1.png', 2, CURRENT_TIMESTAMP),
(11, 'butterCookie.png',   3, CURRENT_TIMESTAMP),
(12, 'strawberry-cake.png',  1, CURRENT_TIMESTAMP),
(12, 'strawberry-cake1.png', 2, CURRENT_TIMESTAMP),
(12, 'strawberryCake.png',   3, CURRENT_TIMESTAMP),
(13, 'bagel-cream-cheese.png',  1, CURRENT_TIMESTAMP),
(13, 'bagel-cream-cheese1.png', 2, CURRENT_TIMESTAMP),
(13, 'bagelCreamCheese.png',    3, CURRENT_TIMESTAMP),
(14, 'beef-bagel.png',  1, CURRENT_TIMESTAMP),
(14, 'beef-bagel1.png', 2, CURRENT_TIMESTAMP),
(14, 'beefBagel.png',   3, CURRENT_TIMESTAMP),
(15, 'ham-cheese-sandwich.png',  1, CURRENT_TIMESTAMP),
(15, 'ham-cheese-sandwich1.png', 2, CURRENT_TIMESTAMP),
(15, 'hamCheeseSandwich.png',    3, CURRENT_TIMESTAMP),
(16, 'scrambled-egg-sandwich.png',  1, CURRENT_TIMESTAMP),
(16, 'scrambled-egg-sandwich1.png', 2, CURRENT_TIMESTAMP),
(16, 'scrambledEggSandwich.png',    3, CURRENT_TIMESTAMP),
(17, 'tuna-sandwich.png',  1, CURRENT_TIMESTAMP),
(17, 'tuna-sandwich1.png', 2, CURRENT_TIMESTAMP),
(17, 'tunaSandwich.png',   3, CURRENT_TIMESTAMP),
(18, 'turkey-sandwich.png',  1, CURRENT_TIMESTAMP),
(18, 'turkey-sandwich1.png', 2, CURRENT_TIMESTAMP),
(18, 'turkeySandwich.png',   3, CURRENT_TIMESTAMP),
(19, 'chocolate-croissant.png',   1, CURRENT_TIMESTAMP),
(19, 'chocolate-croissant1.png',  2, CURRENT_TIMESTAMP),
(19, 'chocolateCroissant.png',    3, CURRENT_TIMESTAMP),
(19, 'chocolate- croissant1.png', 4, CURRENT_TIMESTAMP),
(20, 'chocolate-mousse.png',  1, CURRENT_TIMESTAMP),
(20, 'chocolate-mousse1.png', 2, CURRENT_TIMESTAMP),
(20, 'chocolateMousse.png',   3, CURRENT_TIMESTAMP),
(1,  'blank.png',            3, CURRENT_TIMESTAMP);
