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

## 4. 관리자 문의 (admin/inquiries)

### 변경 사항
- **목록**: 문의항목속성(inquiryType) 열 추가, 제목/내용 미리보기 왼쪽 정렬, 관리 열에 삭제 버튼 추가.
- **상세**: 2/3 너비 가운데, 문의항목·첨부파일 표시, 답변 등록 버튼 오른쪽 배치.

### 검토 결과
- 백엔드: `inquiryToMap`에 `inquiryType`, `attachmentUrl` 포함. `DELETE /api/admin/inquiries/{id}` 및 `InquiryUseCase.deleteById` 추가. 404 후 삭제 흐름 적절.
- 프론트: 삭제 확인 후 `loadList()` 호출, `deletingId`로 중복 클릭 방지. 상세 첨부 링크는 상대/절대 URL 모두 처리.

---

## 5. 관리자 공지 (추가 수정)

- **상세**: ← 목록 링크 맨 위 왼쪽, 이전/다음 텍스트 링크로 양끝 배치, 제목과 분리.
- **수정/등록**: 카드 내 공지 수정·공지 등록 제목 제거, 구분+상단고정 한 줄, 제목* 가까이, 내용을 label→div로 변경해 에디터 포커스 문제 해결, 첨부파일 버튼 연동 및 download 속성.
- **목록**: 공지사항 목록 문구 제거, 검색창 왼쪽/공지 등록 오른쪽.

---

## 6. 관리자 RAG·설정

- **RAG**: 문서 전송 버튼 오른쪽 배치, 저장된 문서 테이블 셀 전부 가운데 정렬(contentPreview·actions 포함).
- **설정**: 2/3 너비 가운데, 설정 저장 버튼 오른쪽. 점검모드 제거. 운영에 도메인별 활성/비활성(메뉴·주문·공지·문의·회원). 기본정보에 사업자정보(사업자등록번호·상호명·대표자명·업태·종목) 추가.

### 검토 결과
- 설정: `AdminSettingsDto` 확장, `SETTING_KEYS`로 fetch/update 일관 처리. `v !== undefined`일 때만 body에 포함해 불필요 전송 방지. 백엔드는 기존 키-값 저장이라 변경 없음.

---

*리뷰 일시: 최근 푸시 직전*
