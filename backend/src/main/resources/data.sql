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

-- 카테고리 삽입 (Hibernate ddl-auto=create 시 매번 초기화됨)
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
    updated_at TIMESTAMP
);

-- 메뉴 삽입 (단일 menus 테이블, is_sold_out, sort_order 포함)
INSERT INTO menus (kor_name, eng_name, category_id, price, description, is_available, is_sold_out, sort_order, created_at, updated_at) VALUES
('아메리카노', 'Americano', 1, 4500, '진한 에스프레소의 맛', true, false, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('카페라떼', 'Cafe Latte', 2, 5000, '부드러운 우유의 라떼', true, false, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('카푸치노', 'Cappuccino', 2, 5500, '크리미한 거품감', true, false, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('카라멜 마끼아또', 'Caramel Macchiato', 2, 6500, '달콤한 카라멜', true, false, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
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

-- images 테이블 (없으면 생성)
CREATE TABLE IF NOT EXISTS images (
    id BIGSERIAL PRIMARY KEY,
    menu_id BIGINT,
    src_url VARCHAR(500),
    created_at TIMESTAMP,
    sort_order INT
);

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
