# 코드 리뷰 요약 (2025-03)

## 수정한 이슈

### 1. 주문 상세 페이지 — 메뉴 목록 fetch 실패 시 오동작
- **문제**: `getOrder` 성공 후 `/menus` fetch가 실패하면 `.catch`에서 `setError`가 호출되어, 주문 데이터는 있는데도 에러 화면만 보임.
- **조치**: 주문 조회 실패 시에만 `setError` 호출. 메뉴 목록은 별도 fetch로 불러오고, 실패 시 이미지 없이 상품명만 표시하도록 처리.

---

## 리뷰 요약 (문제 없음으로 판단된 부분)

- **주문하기 3카드 레이아웃**: 그리드·접기/펼치기·프로필/쿠폰 연동 일관됨.
- **사용자 정보**: 회원은 프로필 기반, 비회원은 이메일·연락처 입력. 연락처/주소/요청사항은 UI만 반영, API 확장 시 payload 추가 가능.
- **결제 수단 선택**: `paymentMethod` state는 현재 결제 페이지로 전달되지 않음. 추후 쿼리/컨텍스트로 전달 가능.
- **CheckoutLayout wide**: `wide` prop으로 주문 페이지만 넓은 컨테이너 사용, 기존 640px 유지.
- **주소 필드**: 백엔드 Member/UserEntity/프로필·회원가입 반영, Flyway V12 마이그레이션 추가됨.
- **프로필 레이아웃**: 제목 가운데·수정 버튼 오른쪽·닉네임 크게/아이디 작게 적용.
- **/user/orders 리다이렉트**: 목록은 `/user?tab=orders`로 통합, 상세는 `/user/orders/[id]` 유지.

---

## 확장 시 참고 사항

1. **주문 생성 API**: 현재 회원 주문 시 `phone`/`address`/`deliveryRequest` 미전송. 배달·수령인 정보 확장 시 DTO·커맨드에 필드 추가 후 주문 페이지 payload에 `orderPhone`, `orderAddress`, `orderRequest` 연동.
2. **결제 수단**: 주문 페이지 `paymentMethod`를 결제 페이지로 전달하려면 `router.push(\`/payment?orderId=...&method=${paymentMethod}\`)` 또는 결제 단계에서 결제 수단 선택 UI를 두는 방식 검토.
3. **메뉴 이미지**: 주문 상세에서 전체 `/menus` 호출로 이미지 매핑. 메뉴 수가 많아지면 주문 항목의 `menuId`만 모아서 `GET /menus?ids=1,2,3` 같은 API로 줄이는 편이 유리.
4. **접기 카드 max-height**: `cardBodyOpen`에 고정 `max-height: 1200px`. 상품/필드가 매우 많아지면 `max-height`를 더 크게 하거나, CSS만으로는 한계가 있으니 펼침 시 스크롤 영역으로 제한하는 방식 고려.
