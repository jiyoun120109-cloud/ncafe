-- =============================================================================
-- reset-menus-and-images-only.sql
-- =============================================================================
-- 목적: 메뉴·이미지·카테고리만 data.sql 시드 상태로 초기화. 회원·주문·공지 등은 유지.
--
-- 삭제/초기화되는 것: images, favorites, cart_items, menus, categories 후 재삽입.
-- 유지되는 것: users, orders, order_items, notices, inquiries, coupons 등.
-- 참고: order_items.menu_id는 그대로 두므로, 과거 주문은 id 1~20은 새 메뉴와 연결되고
--       21 이상이었던 메뉴는 삭제되어 해당 주문상세는 메뉴 미존재 상태가 됨.
--
-- 실행 순서:
--  1) images 삭제
--  2) favorites, cart_items 삭제 (menu_id 참조 정리)
--  3) menus 삭제
--  4) categories 시퀀스/데이터 초기화 후 재삽입
--  5) menus 시퀀스 리셋 후 재삽입 + product_info·배지 UPDATE
--  6) images 재삽입
--
-- 사용: docker compose exec -T db psql -U ncafe -d ncafedb < backend/scripts/reset-menus-and-images-only.sql
-- 실행 전 백업 권장.
-- =============================================================================

-- 1) 이미지 삭제
DELETE FROM images;

-- 2) 메뉴를 참조하는 데이터 정리 (찜·장바구니 비움)
DELETE FROM favorites;
DELETE FROM cart_items;

-- 3) 메뉴 삭제
DELETE FROM menus;

-- 4) 카테고리 초기화 후 시드 삽입
TRUNCATE categories RESTART IDENTITY CASCADE;
INSERT INTO categories (name, display_order, created_at, updated_at) VALUES
('커피', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('라떼', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('스무디', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('에이드', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('티', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('베이커리', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 5) 메뉴 id 시퀀스 1부터 시작하도록 리셋 후 시드 삽입
ALTER SEQUENCE menus_id_seq RESTART WITH 1;
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

-- 제품정보(영양정보·알레르기) 시드
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

-- 배지·우선순위·좋아요·조회수 시드
UPDATE menus SET is_popular = true, display_priority = 10, like_count = 120, view_count = 850 WHERE id = 1;
UPDATE menus SET is_new = true, display_priority = 9, like_count = 80, view_count = 420 WHERE id = 6;
UPDATE menus SET is_recommended = true, display_priority = 8, like_count = 95, view_count = 610 WHERE id = 2;
UPDATE menus SET is_popular = true, is_recommended = true, display_priority = 7, like_count = 110, view_count = 720 WHERE id = 4;
UPDATE menus SET is_new = true, display_priority = 6, like_count = 45, view_count = 280 WHERE id = 8;
UPDATE menus SET like_count = 60, view_count = 390 WHERE id = 3;
UPDATE menus SET like_count = 30, view_count = 180 WHERE id = 5;

-- 6) 이미지 시드 삽입
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
(19, 'chocolate-croissant1.png', 4, CURRENT_TIMESTAMP),
(20, 'chocolate-mousse.png',  1, CURRENT_TIMESTAMP),
(20, 'chocolate-mousse1.png', 2, CURRENT_TIMESTAMP),
(20, 'chocolateMousse.png',   3, CURRENT_TIMESTAMP),
(1,  'blank.png',            3, CURRENT_TIMESTAMP);
