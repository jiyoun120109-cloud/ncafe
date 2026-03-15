# 코드 리뷰 요약 (최근 변경)

## 1. 관리자 주문 (admin/orders)

### 변경 사항
- **검색**: 주문번호·이메일·연락처 검색 추가. 왼쪽 검색창, 오른쪽 상태·기간·버튼 레이아웃(회원관리와 동일).
- **관리 열**: th/td `thActions`, `tdActions`로 가운데 정렬.
- **주문 상세**: 회원 주문 시 이메일/연락처를 회원정보(`userEmail`, `userPhone`)에서 표시. 상태저장·주문취소 버튼 오른쪽 배치.

### 검토 결과
- 백엔드: `OrderJpaRepository`에 `JpaSpecificationExecutor` 추가, `findOrdersForAdmin`에서 search/status/from/to 조건 조합 적절. `search` 비어 있으면 기존 분기 유지.
- 프론트: `search`/`searchInput` 분리, `hasFilter`에 search 포함, 초기화 시 검색어 초기화 처리 일관됨.
- 주문 상세: `userId` 있을 때 `userEmail`/`userPhone` 우선 표시, 없으면 `guestEmail`/`guestPhone` 사용 적절.

---

## 2. 관리자 공지 (admin/notices)

### 변경 사항
- **목록**: 검색 버튼 제거, 검색 입력창만 사용(Enter로 검색). 입력창 길이 확대(min-width 280px, max-width 420px), 왼쪽 배치.
- **상세/수정**: 본문 너비 66.666%(2/3), 가운데 정렬.

### 검토 결과
- 검색 폼에서 버튼 제거 후 `aria-label`로 접근성 유지.
- 상세는 `[id]/page.module.css`의 `.page`에 width/margin 적용, 수정은 `narrowPageWrap`로 감싸 동일 너비 적용. 구조 일관됨.

---

## 3. 기타

- **CategoryManage / CategoryTabs**: 기존 수정 분 포함. 스타일·구조만 변경된 경우 동일 원칙으로 검토 권장.
- 린트: 프론트 수정 파일 기준 오류 없음.

---

*리뷰 일시: 최근 푸시 직전*
