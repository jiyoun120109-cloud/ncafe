# 챗봇 이슈 원인 정리

## 1. 페이지 이동이 안 되는 원인

### 원인
- **Agent(Gemini)가 도구를 안 돌려주는 경우**가 있음. 예: "메뉴페이지로 이동 해줘"라고 하면 AI가 **텍스트만** ("네, 메뉴 페이지로 이동해 드릴게요!") 로 답하고, `navigate_to_page` **function_call**을 하지 않을 수 있음.
- **BFF**는 Agent 응답에 `tools`가 있을 때만 그대로 전달함. Agent가 `tools: []` 또는 `tools` 없이 오면, BFF가 **패턴 기반 보정(detectTools)** 을 하지 않아서 프론트엔드에 도구가 전달되지 않음.
- **프론트엔드**는 `tools`에 `navigate_to_page`가 한 개일 때만 `router.push(path)`를 함. `tools`가 비어 있으면 이동 로직이 아예 실행되지 않음.

### 관련 코드 위치
| 구분 | 파일 | 줄/위치 | 설명 |
|------|------|---------|------|
| BFF | `frontend/app/api/chat/route.ts` | 279~301 | Agent 호출 후 `data.tools`만 쓰고, 비었을 때 `detectTools`로 보정하지 않음 |
| 프론트 | `frontend/components/GuestChat/GuestChat.tsx` | 276~298 | `navTools`, `hasSingleNav`, `path` 계산 후 `router.push(path)` 실행 |
| 프론트 | `frontend/components/GuestChat/GuestChat.tsx` | 394~396 | 이동이 1개일 때 **버튼을 숨김** → 이동 실패 시 클릭할 링크도 없음 |

---

## 2. 사용자 문자가 두 줄로 보이는 원인

### 원인
- 사용자 말풍선에 **`max-width: 85%`** 만 있고 **줄바꿈 제어**가 없어서, 짧은 문장도 **공백 기준으로** 다음 줄로 넘어감.
- 예: "메뉴페이지로 이동 해줘" → "메뉴페이지로 이동" / "해줘" 처럼 **시각적으로** 두 줄로 보임 (실제 `\n` 문자와 무관).

### 관련 코드 위치
| 구분 | 파일 | 줄/위치 | 설명 |
|------|------|---------|------|
| CSS | `frontend/components/GuestChat/GuestChat.module.css` | 158~165 | `.msgBubble` 에 `max-width: 85%`, `white-space: pre-line` |
| CSS | `frontend/components/GuestChat/GuestChat.module.css` | 166~170 | `.msgUser .msgBubble` (사용자 말풍선) |

입력값 자체는 **한 줄**로만 저장됨:
- `GuestChat.tsx` 167: `raw = (input || '').replace(/\r?\n/g, '').trim()`
- `GuestChat.tsx` 558: `onChange` 에서 `replace(/\r?\n/g, '')` 로 줄바꿈 제거

---

## 3. 챗봇 말풍선만 하나 나오는 원인

### 원인
- 봇 메시지는 **텍스트 말풍선 하나** + **도구 버튼/링크 영역**으로 구성되어 있음.
- 그런데 **이동이 1개일 때**는 "자동으로 이동할 거라"고 가정하고 **버튼/링크를 아예 그리지 않음** (`navCount <= 1` 이면 `return null`).
- 그래서 **실제로는 `router.push`가 안 되었어도** 사용자 입장에는 **말풍선만 하나** 보이고, "**[메뉴 페이지로 이동]**" 같은 건 AI가 쓴 **일반 텍스트**(마크다운)로만 보임.

### 관련 코드 위치
| 구분 | 파일 | 줄/위치 | 설명 |
|------|------|---------|------|
| 프론트 | `frontend/components/GuestChat/GuestChat.tsx` | 389~390 | 봇 메시지: `m.text` 말풍선 하나 |
| 프론트 | `frontend/components/GuestChat/GuestChat.tsx` | 391~411 | `m.tools` 가 있을 때만 `toolActions` 렌더, 그 안에서 `navCount <= 1` 이면 **수정/이동 링크를 렌더하지 않음** |
| 프론트 | `frontend/components/GuestChat/GuestChat.tsx` | 282 | `hasSingleNav` 일 때 `replyText = '이동 완료!'` 로 덮어써서, AI가 준 안내 문구가 사라짐 |
