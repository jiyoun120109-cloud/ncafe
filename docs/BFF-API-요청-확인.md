# BFF API 요청 확인 (직접 백엔드 호출 여부)

클라이언트/서버가 **백엔드를 직접 호출하지 않고** 항상 **BFF(Next.js `/api`)를 경유**하는지 정리한 문서입니다.

---

## ✅ API 요청이 BFF를 거치는 곳

| 위치 | 호출 방식 | 실제 요청 URL (클라이언트) |
|------|------------|----------------------------|
| **lib/api.ts** | `fetch('/api' + endpoint)` | `origin + '/api/auth/login'` 등 |
| **authService** | authAPI → fetchAPI | 동일 (상대 경로 `/api/...`) |
| **useUserMenus** | `getApiBase() + '/menus'` | `origin + '/api/menus'` |
| **useUserMenuDetail** | `getApiBase() + '/menus/${id}'` | `origin + '/api/menus/...'` |
| **useUserMenuDetailImages** | `getApiBase() + '/menus/.../menu-images'` | `origin + '/api/menus/...'` |
| **useUserCategories** | `fetcher('/categories')`, `fetcher('/menus')` | `origin + '/api/categories'`, `origin + '/api/menus'` |
| **useCategories** (admin) | `fetcher('/categories')`, `fetcher('/menus')` | 동일 |
| **useMenus** (admin) | `fetch(origin + '/api/admin/menus')` | `origin + '/api/admin/menus'` |
| **useMenuDetail** (admin) | `fetcher('/admin/menus/${id}')` | `origin + '/api/admin/menus/...'` |
| **useMenuDetailImages** (admin) | `fetch('/api/admin/menus/.../menu-images')` | 상대 경로 → same origin |

`getApiBase()`는 **브라우저**에서 `window.location.origin + '/api'`만 반환하므로, 위 API 호출은 모두 **같은 출처의 BFF**로만 나갑니다.

---

## 🔧 수정한 부분

1. **menuService**  
   - **이전:** `fetcher('/api/menus')` → `getApiBase() + '/api/menus'` = **`/api/api/menus`** (경로 중복)  
   - **이후:** `fetcher('/menus')` → **`/api/menus`** (BFF 한 번만 경유)

2. **getApiBase() (서버)**  
   - **이전:** 서버에서 `API_URL` = `NEXT_PUBLIC_API_URL` 또는 `http://localhost:8011` + `/api` → 백엔드로 직접 요청될 수 있음  
   - **이후:** 서버에서는 `NEXT_PUBLIC_APP_URL`(또는 `NEXT_PUBLIC_API_URL`, 없으면 `http://localhost:3000`) + `/api` 사용 → **앱 자신의 BFF**로만 요청

---

## 배포 시 권장 환경 변수

- **NEXT_PUBLIC_APP_URL**: 프론트 앱의 공개 URL (예: `https://eunami.newlecture.com`). 서버에서 `getApiBase()`로 BFF 호출 시 사용.
- **NEXT_PUBLIC_API_URL**: 클라이언트에서 다른 용도로 쓸 API/앱 URL이 있으면 설정. 서버용 BFF 베이스는 `NEXT_PUBLIC_APP_URL` 우선.

이렇게 하면 API 요청은 모두 BFF를 거치며, 백엔드는 BFF(Next.js API 라우트)에서만 호출됩니다.
