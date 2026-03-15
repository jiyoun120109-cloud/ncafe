-- =============================================================================
-- fix-menu-images-by-name.sql
-- =============================================================================
-- 목적: images 테이블에서 "매핑에 있는" 메뉴들의 이미지를 kor_name에 맞는
--       파일명 목록으로 통째로 교체. (테이블 생성/삭제 없음)
--
-- 실행 시 images 테이블이 어떻게 바뀌는지:
--
--  [1] 매핑 대상 메뉴
--      menus 테이블에서 TRIM(kor_name)이 name_to_files에 있는 메뉴들
--      예: 아메리카노, 카페라떼, 두바이 쫀득 쿠키, ...
--
--  [2] DELETE
--      위 메뉴들의 menu_id에 해당하는 images 행 전부 삭제.
--      예: menu_id IN (1,2,3,7,8,9,...) 인 행들이 삭제됨.
--
--  [3] INSERT
--      각 매핑 대상 메뉴에 대해, name_to_files에 정의된 (src_file, sort_order)
--      조합만큼 새 행 삽입. 한 메뉴당 1~4개 행.
--      예: menu_id=8(두바이 쫀득 쿠키) → 3행 삽입
--          (8, 'DubaiZzondeukCookie.png', 1), (8, 'dubai-zzondeuk-cookie.png', 2), ...
--
--  [4] 매핑에 없는 메뉴
--      고구마 라떼, 망고 스무디 등 name_to_files에 없는 kor_name은
--      DELETE/INSERT 대상이 아니므로 기존 images 행이 그대로 유지됨.
--
-- 사용: psql -U ncafe -d ncafedb -f fix-menu-images-by-name.sql
-- 실행 전 백업 권장.
-- =============================================================================

-- 매핑 정의 (한글 이름당 여러 파일, sort_order 순)
CREATE TEMP TABLE name_to_files (
  kor_name text,
  src_file text,
  sort_order int
);
INSERT INTO name_to_files (kor_name, src_file, sort_order) VALUES
  ('아메리카노', 'americano.png', 1),
  ('아메리카노', 'americano1.png', 2),
  ('카페라떼', 'cafelatte.png', 1),
  ('카페라떼', 'cafelatte1.png', 2),
  ('카페 라떼', 'cafelatte.png', 1),
  ('카페 라떼', 'cafelatte1.png', 2),
  ('카푸치노', 'capuchino.png', 1),
  ('카푸치노', 'capuchino1.png', 2),
  ('카라멜 마끼아또', 'caramel-macchiato.png', 1),
  ('카라멜 마끼아또', 'caramel-macchiato1.png', 2),
  ('카라멜 마끼아또', 'caramelMacchiato.png', 3),
  ('에스프레소', 'espresso.png', 1),
  ('에스프레소', 'espresso1.png', 2),
  ('시그니처 커피', 'signature.png', 1),
  ('시그니처 커피', 'signature1.png', 2),
  ('바나나 라떼', 'bananalatte.png', 1),
  ('바나나 라떼', 'bananalatte1.png', 2),
  ('두바이 쫀득 쿠키', 'DubaiZzondeukCookie.png', 1),
  ('두바이 쫀득 쿠키', 'dubai-zzondeuk-cookie.png', 2),
  ('두바이 쫀득 쿠키', 'dubai-zzondeuk-cookie1.png', 3),
  ('초코칩 쿠키', 'choco-chip-cookie.png', 1),
  ('초코칩 쿠키', 'choco-chip-cookie1.png', 2),
  ('초코칩 쿠키', 'chocoChipCookie.png', 3),
  ('아몬드 쿠키', 'almond-cookie.png', 1),
  ('아몬드 쿠키', 'almond-cookie1.png', 2),
  ('아몬드 쿠키', 'almondCookie.png', 3),
  ('버터 쿠키', 'butter-cookie.png', 1),
  ('버터 쿠키', 'butter-cookie1.png', 2),
  ('버터 쿠키', 'butterCookie.png', 3),
  ('딸기 케이크', 'strawberry-cake.png', 1),
  ('딸기 케이크', 'strawberry-cake1.png', 2),
  ('딸기 케이크', 'strawberryCake.png', 3),
  ('크림치즈 베이글', 'bagel-cream-cheese.png', 1),
  ('크림치즈 베이글', 'bagel-cream-cheese1.png', 2),
  ('크림치즈 베이글', 'bagelCreamCheese.png', 3),
  ('불고기 베이글', 'beef-bagel.png', 1),
  ('불고기 베이글', 'beef-bagel1.png', 2),
  ('불고기 베이글', 'beefBagel.png', 3),
  ('소고기 베이글', 'beef-bagel.png', 1),
  ('소고기 베이글', 'beef-bagel1.png', 2),
  ('소고기 베이글', 'beefBagel.png', 3),
  ('햄치즈 샌드위치', 'ham-cheese-sandwich.png', 1),
  ('햄치즈 샌드위치', 'ham-cheese-sandwich1.png', 2),
  ('햄치즈 샌드위치', 'hamCheeseSandwich.png', 3),
  ('에그 스크램블 샌드위치', 'scrambled-egg-sandwich.png', 1),
  ('에그 스크램블 샌드위치', 'scrambled-egg-sandwich1.png', 2),
  ('에그 스크램블 샌드위치', 'scrambledEggSandwich.png', 3),
  ('에그 샌드위치', 'scrambled-egg-sandwich.png', 1),
  ('에그 샌드위치', 'scrambled-egg-sandwich1.png', 2),
  ('에그 샌드위치', 'scrambledEggSandwich.png', 3),
  ('참치 샌드위치', 'tuna-sandwich.png', 1),
  ('참치 샌드위치', 'tuna-sandwich1.png', 2),
  ('참치 샌드위치', 'tunaSandwich.png', 3),
  ('터키 샌드위치', 'turkey-sandwich.png', 1),
  ('터키 샌드위치', 'turkey-sandwich1.png', 2),
  ('터키 샌드위치', 'turkeySandwich.png', 3),
  ('초콜릿 크루아상', 'chocolate-croissant.png', 1),
  ('초콜릿 크루아상', 'chocolate-croissant1.png', 2),
  ('초콜릿 크루아상', 'chocolateCroissant.png', 3),
  ('초코 크루아상', 'chocolate-croissant.png', 1),
  ('초코 크루아상', 'chocolate-croissant1.png', 2),
  ('초코 크루아상', 'chocolateCroissant.png', 3),
  ('초콜릿 무스', 'chocolate-mousse.png', 1),
  ('초콜릿 무스', 'chocolate-mousse1.png', 2),
  ('초콜릿 무스', 'chocolateMousse.png', 3),
  ('초코릿 무스', 'chocolate-mousse.png', 1),
  ('초코릿 무스', 'chocolate-mousse1.png', 2),
  ('초코릿 무스', 'chocolateMousse.png', 3);

-- 매핑에 있는 메뉴들의 기존 이미지 삭제
DELETE FROM images
WHERE menu_id IN (
  SELECT DISTINCT m.id FROM menus m
  JOIN name_to_files n ON TRIM(m.kor_name) = n.kor_name
);

-- 매핑대로 이미지 행 삽입
INSERT INTO images (menu_id, src_url, sort_order, created_at)
SELECT m.id, n.src_file, n.sort_order, CURRENT_TIMESTAMP
FROM menus m
JOIN name_to_files n ON TRIM(m.kor_name) = n.kor_name;

-- 확인 (수동 실행): SELECT m.id, m.kor_name, array_agg(i.src_url ORDER BY i.sort_order) FROM menus m LEFT JOIN images i ON i.menu_id = m.id GROUP BY m.id, m.kor_name ORDER BY m.id;
