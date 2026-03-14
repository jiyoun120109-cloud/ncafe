# NCafe 개발 가이드라인

기능 추가·수정 시 프로젝트 구조와 코드 스타일을 통일하고, 에러를 줄이기 위한 가이드입니다.  
(cursorrules + 코드 리뷰·재구조화 반영 사항을 정리한 문서)

---

## 1. 기술 스택 (통일 유지)

| 영역 | 스택 | 비고 |
|------|------|------|
| **Frontend** | Next.js 15+ (App Router), TypeScript, CSS Modules + CSS Variables, Zustand, react-hook-form | 프론트는 이 조합 유지 |
| **Backend** | Spring Boot 4, Java 21, JPA, Flyway, PostgreSQL | 헥사고날(포트·어댑터) 스타일 |
| **API 경계** | BFF: 클라이언트 → `/api/*` → Next.js가 JWT/CSRF 붙여 백엔드 또는 agent-server로 프록시 | 백엔드 컨트롤러는 `/api/...` prefix 사용 |

---

## 2. 프론트엔드 구조 (반드시 지킬 것)

### 2.1 라우트·폴더 배치

- **관리자 전용** → `frontend/app/admin/` 아래만 사용.  
  예: `admin/menus`, `admin/notices`, `admin/categories`, `admin/orders` 등.
- **사용자·공통** → `app/` 최상위(admin 밖).  
  예: `app/menus`, `app/cart`, `app/order`, `app/user`, `app/login`, `app/page.tsx` 등.
- **라우트당 컴포넌트** → 해당 라우트 폴더 안에 `_components/` 두고, 그 기능 전용 UI만 넣기.  
  예: `app/admin/menus/_components/MenuCard`, `app/menus/_components/AddToCartModal`.

### 2.2 루트 `components/` vs 기능별 `_components/`

| 위치 | 용도 | 예시 |
|------|------|------|
| **`frontend/components/`** | **진짜 공통**만 (여러 도메인/라우트에서 쓰는 것) | PageWithHero, CheckoutLayout, SiteHeader, HeaderAuth, AdminGuard, common/(Toast, Input, Button, Modal, Card) |
| **`app/.../ _components/`** | **그 라우트/기능 전용** | AddToCartModal → `app/menus/_components/`, StampCard → `app/user/_components/`, RichEditor → `app/admin/notices/_components/`, DeleteConfirmModal → `app/admin/_components/` |

- 새 컴포넌트 추가 시: “한 라우트/한 기능에서만 쓴다” → 해당 라우트의 `_components/`에 둠.  
  “여러 라우트에서 쓴다” → `components/` 또는 admin 공통이면 `app/admin/_components/`.

### 2.3 admin 공통 vs 라우트 전용

- **여러 admin 라우트에서 재사용** → `app/admin/_components/`  
  예: `CategoryManage`, `useAdminCategories`, `DeleteConfirmModal`.
- **한 admin 라우트 전용** → 해당 라우트 `_components/`  
  예: `app/admin/menus/_components/MenuCard`, `app/admin/notices/_components/RichEditor`.

### 2.4 컴포넌트 폴더 패턴 (cursorrules와 동일)

```
ComponentName/
├── ComponentName.tsx
├── ComponentName.module.css
└── index.ts   # export { default } from './ComponentName'
```

- 컴포넌트·폴더: **PascalCase**.  
  Props 인터페이스: **ComponentNameProps**.
- **비라우트 폴더**는 `_` 접두사 사용 (`_components`, `_utils`).

### 2.5 Import 경로

- **절대 경로(alias) 우선.**  
  예: `@/app/admin/notices/_components/RichEditor/RichEditor`, `@/utils/menuImageUrl`, `@/services/cartService`.
- 라우트 구조가 바뀔 수 있는 곳은 **상대 경로 대신 alias** 사용하면 폴더 이동 시 한 곳만 수정하면 됨.

---

## 3. 프론트엔드에서 꼭 쓰는 유틸·서비스

### 3.1 메뉴 이미지 URL

- **파일**: `frontend/utils/menuImageUrl.ts`
- **함수**:  
  - `menuImageUrl(url: string | null | undefined): string` — 표시용 URL (빈 값 → `/images/missing`, http 검사, 파일명 → `/images/{filename}`).  
  - `isValidMenuImageUrl(url): boolean` — 이미지로 쓸 수 있는지 검사.
- **규칙**: 메뉴/장바구니/주문/메인 쇼케이스 등 **메뉴 이미지**는 모두 이 함수만 사용.  
  인라인으로 `/images/...` 만들지 말 것.

### 3.2 API 호출

- **인증 필요 API** (로그인/로그아웃/세션/회원가입 등): `lib/api.ts` → `authAPI`, `fetchAPI`.  
  (401 시 리다이렉트 등 처리됨.)
- **그 외 API**: `services/api.ts`의 `getApiBase()` + 경로, 필요 시 `fetcher()`.  
  서비스 레이어에서 `Authorization`/`X-XSRF-TOKEN` 직접 넣지 말 것 → BFF(`app/api/[...path]/route.ts`)에서 세션·CSRF 붙임.

### 3.3 타입·DTO

- **장바구니 아이템**: `services/cartService.ts`의 `CartItemDto` (이미지 필드: `menuImageUrl`).  
  필드명 바꾸면 서비스 타입 + `menuImageUrl()` 사용처(cart/order 페이지) 함께 수정.
- **메인 쇼케이스 메뉴**: `app/page.tsx`의 `ShowcaseMenu` 등 API 응답과 필드명을 맞출 것.  
  API가 `imageSrc` → `menuImageUrl` 등으로 바꾸면 인터페이스와 fetch/사용처를 함께 수정.

---

## 4. 백엔드 구조 (헥사고날 기준)

- **참조 도메인**: `admin/menu` 구조에 맞추는 것을 권장.
- **레이어**: adapter/in (Controller, DTO), adapter/out (persistence, JPA 등), application/service, application/port/in (UseCase), application/port/out (Repository 등), application/command·result, model (도메인 모델).
- **도메인 모델 패키지**: 전 도메인 **`model/`** 로 통일 (기존 `domain/model/` 제거 반영됨).
- **userId 추출**: JWT에서 꼭 `JwtService.getUserIdFromClaims(...)` 사용.  
  `Long.parseLong(claims.getSubject())` 직접 사용 금지 (NumberFormatException 방지).
- **예외**: `GlobalExceptionHandler`에서 JSON 형식 통일.  
  새 예외 타입 추가 시 여기서 처리할지 결정.

---

## 5. 기능 추가 시 체크리스트

- [ ] **새 페이지**가 관리자용이면 `app/admin/...`, 사용자용이면 `app/...` (admin 밖).
- [ ] **새 컴포넌트**가 한 라우트/한 기능 전용이면 해당 `_components/`, 여러 곳 공통이면 `components/` 또는 `admin/_components/`.
- [ ] **메뉴 이미지** 쓸 때는 `menuImageUrl()` / `isValidMenuImageUrl()` 만 사용.
- [ ] **API 호출**은 인증용이면 `lib/api`, 나머지는 `getApiBase()` + 서비스 레이어.
- [ ] **타입/DTO**는 서비스·타입 파일에 한 곳 정의하고, API 필드명 바뀔 때 주석/타입으로 “여기랑 사용처 함께 수정” 명시.
- [ ] **동적 import** 시 가능하면 `@/app/...` 같은 alias 사용 (폴더 이동 대비).
- [ ] **반복 로직** (에러 메시지 파싱, 옵션 목록 등)은 작은 유틸/상수로 빼서 한 곳만 수정되게.

---

## 6. 주의 사항 (에러 방지)

- **API 응답 형식 변경**: 백엔드가 `{ id, name }` → `{ data: { id, name } }` 처럼 바꾸면, 프론트 파싱은 **한 곳**(해당 훅/서비스)만 수정.  
  해당 위치에 “API 스펙: 201 시 본문 형태” 같은 주석 유지.
- **이미지/필드명 불일치**: 메인/메뉴/장바구니/주문에서 쓰는 필드명(`imageSrc`, `menuImageUrl` 등)을 API·타입과 맞추고, 변경 시 타입 정의 파일 + 사용처를 함께 수정.
- **미사용 export**: `getImageBase()` 같은 사용처 없는 함수는 제거하거나 용도 명확히.

---

## 7. 참고

- **컴포넌트 import**: `index.ts`로 re-export 해두었으면 `from './_components/MenuCard'` 처럼 디렉터리만 써도 됨.  
  동적 import 등에서는 `@/app/.../ComponentName/ComponentName` 처럼 풀 경로 사용해도 됨.
- **시맨틱 HTML**: `main`, `header`, `nav`, `section` 등 적절히 사용.
- 추가 계획은 `FRONTEND_BLUEPRINT.md` 등 프로젝트 계획 문서와 함께 참고.

이 가이드를 지키면 구조·호출·이름·경로가 통일되고, 이후 기능 추가 시 에러를 줄일 수 있습니다.
