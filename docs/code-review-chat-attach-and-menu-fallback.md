# 코드 리뷰: 챗봇 첨부파일 + 메뉴 조회 fallback

## 변경 범위
- **agent-server**: 첨부파일(이미지) 수신·Gemini 전달, 메뉴 이름으로 조회 시 fallback
- **frontend**: 챗봇 첨부 버튼·전송( base64 ), BFF에서 attachments 전달

---

## 1. agent-server

### backend_client.py
- **장점**: `_match_menu_by_name`으로 매칭 로직 분리, 검색 실패 시 전체 목록에서 korName/engName 재탐색으로 menuId 확보 가능.
- **참고**: `fetch_menus(None)`은 메뉴 수가 많을 때 비용 증가. 필요 시 페이지네이션/캐시 검토.

### schemas.py
- **Attachment**: `mime_type`, `data` (base64). BFF가 camelCase → snake_case 변환해 전달하므로 일치함.
- **Message.attachments**: optional, 기존 클라이언트 호환 유지.

### chat.py
- **to_gemini_messages**: attachments를 `inline_data` parts로 붙이는 방식이 Gemini 스펙과 맞음.
- **resolve_tools**: add_to_cart 시 `find_menu_by_name` 실패해도 tool은 그대로 전달되고, menuId만 비어 있을 수 있음 → 프론트는 `menuId` 있을 때만 위젯 표시.

### gemini.py
- **_to_contents**: `text` / `inline_data` 둘 다 처리, `Part.from_bytes`로 이미지 전달. 빈 base64는 try/continue로 스킵.

---

## 2. frontend

### app/api/chat/route.ts
- **messages 필터**: `content !== '' || (attachments?.length > 0)` 로, 텍스트 없이 첨부만 있어도 메시지 유지.
- **toAgentMessages**: attachments를 `mime_type`/`data` 형태로 agent에 전달. stream/비 stream 모두 동일 payload 사용.

### GuestChat.tsx / GuestChat.module.css
- **첨부**: 최대 3개, 이미지·PDF, 10MB 제한. 전송 시 base64 변환 후 마지막 user 메시지에 attachments 붙여 전송.
- **전송 버튼**: `!input.trim() && attachedFiles.length === 0` 일 때만 비활성화.
- **attachChips**: 파일명 + 제거 버튼. 스타일은 module.css에 추가됨.

---

## 3. 개선 제안 (선택)
- **backend_client**: `fetch_menus(None)` 호출 빈도가 높으면 TTL 짧은 메모리 캐시 고려.
- **GuestChat**: PDF는 Gemini가 이미지가 아니라서 미지원일 수 있음. 이미지만 허용하거나 에러 메시지로 안내 가능.
- **에러 처리**: 첨부 base64 변환 실패 시 현재는 사용자 메시지를 에러 문구로 덮어씀. 토스트/인라인 에러가 더 나을 수 있음.

---

리뷰 일자: 변경 푸시 시점 기준.
