# 코드 리뷰 요약 (2025-03-15)

## 변경 범위
- 주문 저장 409 원인 대응: `order_number` NOT NULL 위반 해결, DataIntegrityViolation 시 401/메시지 개선

## 리뷰 결과

### ✅ GlobalExceptionHandler
- 주문 관련 DataIntegrityViolation 시 `customer_id`/`user_id` null 위반이면 401 + 재로그인 메시지로 응답 → 클라이언트가 409 대신 재로그인 유도 가능.
- 기존 카테고리/삭제 실패 메시지·409 동작 유지.

### ✅ OrderEntity
- `order_number` 컬럼 매핑 추가 (length 64). DB에 NOT NULL로 있는 배포 환경 대응.

### ✅ OrderPersistenceAdapter
- 새 주문 저장 시 `order_number` 생성: `ORD-yyyyMMddHHmmss-XXXX` (ThreadLocalRandom 4자리).
- 동일 초 내 중복 가능성은 낮음(1/10000). 필요 시 시퀀스/DB 생성으로 확장 가능.

### ✅ V6__orders_order_number.sql
- `order_number` 컬럼 없을 때만 VARCHAR(64) 추가. 기존 배포 DB는 변경 없음, 앱에서 값 설정.

## 권장 사항 (선택)
- DataIntegrityViolation 로그가 필요하면 `handleDataIntegrityViolation`에 `log.warn(..., ex)` 추가.
