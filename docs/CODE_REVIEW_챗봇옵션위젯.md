# 코드 리뷰: 챗봇 옵션 위젯 개선 (커피/수량 분리, 상품명 표시)

## 변경 범위
- `agent-server/app/routers/chat.py`: add_to_cart 시 isCoffee 플래그 추가
- `frontend/components/GuestChat/GuestChat.tsx`: 커피만 옵션 위젯, 상품명 라벨
- `frontend/components/GuestChat/GuestChat.module.css`: cartOptionProductName 스타일

## 리뷰 포인트

### ✅ 잘된 부분
- **에이전트**: `found = None` 초기화 후 `if found`로 안전하게 categoryName 접근. 메뉴 미조회 시 isCoffee=False로 수량만 노출.
- **프론트**: `isCoffee === true`로만 옵션 표시해 서버에서 오는 값 누락/오타 시에도 수량만 보이도록 방어.
- **담기 옵션**: 비커피는 `addItem(menuId, quantity, {})`로 옵션 없이 전달해 장바구니/백엔드와 일치.
- **접근성**: 상품명 블록에 `aria-label={`${menuName} 옵션 선택`}` 적용.
- **다건 담기**: 블록마다 상품명을 맨 위에 표시해 "아메리카노 1잔, 카페라떼 2잔" 시 구분 명확.

### ⚠️ 참고
- 카테고리명이 "커피"가 아닌 경우(예: "Coffee") 에이전트에서 `category_name == "Coffee"` 등으로 조건 추가 필요.
- `ChatTool` 타입에 `args.isCoffee?: boolean` 추가 시 타입 안정성 향상 가능(선택).

### 테스트 제안
- 커피 메뉴 담기 → 온도/디카페인/원두/수량 모두 표시 및 담기 동작
- 비커피 메뉴 담기 → 수량만 표시, 담기 시 옵션 없이 저장
- "아메리카노 1잔, 카페라떼 2잔 담아줘" → 위젯 2개, 각각 상품명 "아메리카노" / "카페라떼" 표시 확인
