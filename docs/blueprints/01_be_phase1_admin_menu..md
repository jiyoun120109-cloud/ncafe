# NCafe 백엔드 청사진 (Blueprint) - Phase 1

> 📅 작성일: 2026-01-23
> 🎯 목표: 프론트엔드 메뉴 관리 페이지를 위한 REST API 구현

---

## 1. 기술 스택

### 🔧 Core Framework
| 기술 | 버전 | 선정 이유 |
|------|------|----------|
| **Spring Boot** | 4.0.x | 최신 안정 버전, 생산성 |
| **Java** | 21 | LTS 버전, 최신 기능 |
| **Gradle** | 9.x | 빌드 도구 |

### 📦 주요 의존성 (추가 필요)
| 라이브러리 | 용도 | 필수 여부 |
|-----------|------|----------|
| `spring-boot-starter-data-jpa` | JPA/Hibernate ORM | ✅ 필수 |
| `spring-boot-starter-validation` | 입력값 검증 | ✅ 필수 |
| `h2` 또는 `mysql-connector` | 데이터베이스 | ✅ 필수 |
| `lombok` | 보일러플레이트 감소 | ⭕ 권장 |

---

## 2. 디렉토리 구조

```
backend/
├── src/main/java/com/new_cafe/app/backend/
│   ├── BackendApplication.java
│   │
│   ├── config/                     # 설정
│   │   ├── WebConfig.java          # CORS 설정
│   │   └── JpaConfig.java          # JPA 설정
│   │
│   ├── controller/
│   │   └── admin/                  # 🎯 Admin API
│   │       ├── MenuController.java
│   │       ├── CategoryController.java
│   │       └── ImageController.java
│   │
│   ├── dto/                        # 요청/응답 DTO
│   │   ├── request/
│   │   │   ├── MenuCreateRequest.java
│   │   │   ├── MenuUpdateRequest.java
│   │   │   └── MenuSortOrderRequest.java
│   │   └── response/
│   │       ├── MenuResponse.java
│   │       ├── MenuListResponse.java
│   │       └── ApiResponse.java
│   │
│   ├── entity/                     # JPA 엔티티
│   │   ├── Menu.java
│   │   ├── MenuImage.java
│   │   ├── MenuOption.java
│   │   ├── OptionItem.java
│   │   └── Category.java
│   │
│   ├── repository/                 # JPA Repository
│   │   ├── MenuRepository.java
│   │   ├── CategoryRepository.java
│   │   └── MenuImageRepository.java
│   │
│   ├── service/                    # 비즈니스 로직
│   │   ├── MenuService.java
│   │   ├── CategoryService.java
│   │   └── ImageService.java
│   │
│   └── exception/                  # 예외 처리
│       ├── GlobalExceptionHandler.java
│       └── MenuNotFoundException.java
│
├── src/main/resources/
│   ├── application.properties
│   └── data.sql                    # 초기 데이터 (개발용)
│
└── build.gradle
```

---

## 3. API 엔드포인트 명세

### 📋 Base URL
```
개발: http://localhost:8080/api
```

### 3.1 메뉴 API (`/api/admin/menus`)

| Method | Endpoint | 설명 | 요청 | 응답 |
|--------|----------|------|------|------|
| `GET` | `/api/admin/menus` | 메뉴 목록 조회 | Query: `categoryId`, `search`, `status` | `MenuListResponse[]` |
| `GET` | `/api/admin/menus/{id}` | 메뉴 상세 조회 | Path: `id` | `MenuResponse` |
| `POST` | `/api/admin/menus` | 메뉴 등록 | Body: `MenuCreateRequest` | `MenuResponse` |
| `PUT` | `/api/admin/menus/{id}` | 메뉴 수정 | Path: `id`, Body: `MenuUpdateRequest` | `MenuResponse` |
| `DELETE` | `/api/admin/menus/{id}` | 메뉴 삭제 | Path: `id` | `void` |
| `PATCH` | `/api/admin/menus/{id}/sold-out` | 품절 상태 토글 | Path: `id` | `MenuResponse` |
| `PATCH` | `/api/admin/menus/sort-order` | 메뉴 순서 변경 | Body: `MenuSortOrderRequest[]` | `void` |

### 3.2 카테고리 API (`/api/admin/categories`)

| Method | Endpoint | 설명 | 요청 | 응답 |
|--------|----------|------|------|------|
| `GET` | `/api/admin/categories` | 카테고리 목록 조회 | - | `CategoryResponse[]` |
| `POST` | `/api/admin/categories` | 카테고리 등록 | Body: `CategoryCreateRequest` | `CategoryResponse` |
| `PUT` | `/api/admin/categories/{id}` | 카테고리 수정 | Path: `id`, Body: `CategoryUpdateRequest` | `CategoryResponse` |
| `DELETE` | `/api/admin/categories/{id}` | 카테고리 삭제 | Path: `id` | `void` |

### 3.3 이미지 API (`/api/admin/images`)

| Method | Endpoint | 설명 | 요청 | 응답 |
|--------|----------|------|------|------|
| `POST` | `/api/admin/images` | 이미지 업로드 | Multipart: `file` | `ImageResponse` |
| `DELETE` | `/api/admin/images/{id}` | 이미지 삭제 | Path: `id` | `void` |

---

## 4. 요청/응답 DTO 구조

### 📥 Request DTOs

```java
// MenuCreateRequest.java
{
  "korName": "아메리카노",           // 필수, 1-50자
  "engName": "Americano",           // 선택, 1-100자
  "description": "진한 에스프레소", // 선택, 0-500자
  "price": 4500,                    // 필수, 0 이상
  "categoryId": "cat-001",          // 필수
  "imageIds": ["img-001", "img-002"], // 선택, 이미지 ID 목록
  "primaryImageId": "img-001",      // 선택, 대표 이미지 ID
  "isAvailable": true,              // 기본값: true
  "isSoldOut": false,               // 기본값: false
  "options": [                      // 선택
    {
      "name": "사이즈",
      "type": "radio",
      "required": true,
      "items": [
        { "name": "Regular", "priceDelta": 0 },
        { "name": "Large", "priceDelta": 500 }
      ]
    }
  ]
}

// MenuUpdateRequest.java
// MenuCreateRequest와 동일 구조

// MenuSortOrderRequest.java
{
  "id": "menu-001",
  "sortOrder": 1
}

// CategoryCreateRequest.java
{
  "korName": "커피",
  "engName": "Coffee",
  "icon": "coffee",
  "sortOrder": 1
}
```

### 📤 Response DTOs

```java
// MenuResponse.java (상세 조회용)
{
  "id": "menu-001",
  "korName": "아메리카노",
  "engName": "Americano",
  "description": "진한 에스프레소와 물의 조화",
  "price": 4500,
  "category": {
    "id": "cat-001",
    "korName": "커피",
    "engName": "Coffee"
  },
  "images": [
    {
      "id": "img-001",
      "url": "/images/menu/americano.jpg",
      "isPrimary": true,
      "sortOrder": 1
    }
  ],
  "isAvailable": true,
  "isSoldOut": false,
  "sortOrder": 1,
  "options": [
    {
      "id": "opt-001",
      "name": "사이즈",
      "type": "radio",
      "required": true,
      "items": [
        { "id": "item-001", "name": "Regular", "priceDelta": 0 },
        { "id": "item-002", "name": "Large", "priceDelta": 500 }
      ]
    }
  ],
  "createdAt": "2026-01-22T10:00:00",
  "updatedAt": "2026-01-22T10:00:00"
}

// MenuListResponse.java (목록 조회용 - 간소화)
{
  "id": "menu-001",
  "korName": "아메리카노",
  "engName": "Americano",
  "price": 4500,
  "categoryId": "cat-001",
  "primaryImageUrl": "/images/menu/americano.jpg",
  "isAvailable": true,
  "isSoldOut": false,
  "sortOrder": 1
}

// CategoryResponse.java
{
  "id": "cat-001",
  "korName": "커피",
  "engName": "Coffee",
  "icon": "coffee",
  "sortOrder": 1,
  "menuCount": 5
}

// ImageResponse.java
{
  "id": "img-001",
  "url": "/images/menu/uploaded-image.jpg",
  "originalName": "americano.jpg",
  "size": 102400
}

// ApiResponse.java (공통 래퍼)
{
  "success": true,
  "data": { ... },
  "message": "성공",
  "timestamp": "2026-01-22T10:00:00"
}
```

---

## 5. 엔티티 설계

### 📊 ERD 개요

```
┌─────────────────┐       ┌─────────────────┐
│    Category     │       │      Menu       │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │
│ korName         │  │    │ korName         │
│ engName         │  │    │ engName         │
│ icon            │  └───▶│ category_id(FK) │
│ sortOrder       │       │ description     │
│ createdAt       │       │ price           │
│ updatedAt       │       │ isAvailable     │
└─────────────────┘       │ isSoldOut       │
                          │ sortOrder       │
                          │ createdAt       │
                          │ updatedAt       │
                          └────────┬────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
┌─────────────────┐   ┌─────────────────┐
│   MenuImage     │   │   MenuOption    │
├─────────────────┤   ├─────────────────┤
│ id (PK)         │   │ id (PK)         │
│ menu_id (FK)    │   │ menu_id (FK)    │
│ url             │   │ name            │
│ isPrimary       │   │ type            │
│ sortOrder       │   │ required        │
└─────────────────┘   │ sortOrder       │
                      └────────┬────────┘
                               │
                               ▼
                      ┌─────────────────┐
                      │   OptionItem    │
                      ├─────────────────┤
                      │ id (PK)         │
                      │ option_id (FK)  │
                      │ name            │
                      │ priceDelta      │
                      │ sortOrder       │
                      └─────────────────┘
```

---

## 6. Phase 1 백엔드 개발 범위

> **📋 체크리스트 사용 안내 (AI 필독)**
> - 아래 `- [ ]` 항목은 **구현 진행 상황**을 추적하는 체크리스트입니다.
> - **기능 구현이 완료되면** AI가 해당 항목을 `- [x]`로 체크해주세요.

### 🎯 백엔드 API 구현

#### 6.1 프로젝트 설정
- [ ] build.gradle 의존성 추가 (JPA, Validation, H2/MySQL, Lombok)
- [ ] application.properties 설정 (DB, JPA, 파일 업로드)
- [ ] CORS 설정 (WebConfig)
- [ ] 전역 예외 처리 (GlobalExceptionHandler)

#### 6.2 엔티티 구현
- [ ] Category 엔티티
- [ ] Menu 엔티티 (Category 연관관계)
- [ ] MenuImage 엔티티 (Menu 연관관계)
- [ ] MenuOption 엔티티 (Menu 연관관계)
- [ ] OptionItem 엔티티 (MenuOption 연관관계)

#### 6.3 Repository 구현
- [ ] CategoryRepository
- [ ] MenuRepository (검색, 필터링 쿼리 메서드)
- [ ] MenuImageRepository

#### 6.4 DTO 구현
- [ ] Request DTOs (MenuCreateRequest, MenuUpdateRequest 등)
- [ ] Response DTOs (MenuResponse, MenuListResponse 등)
- [ ] ApiResponse 공통 래퍼

#### 6.5 Service 구현
- [ ] CategoryService (CRUD)
- [ ] MenuService (CRUD, 품절 토글, 순서 변경)
- [ ] ImageService (업로드, 삭제)

#### 6.6 Controller 구현
- [ ] CategoryController (카테고리 CRUD)
- [ ] MenuController (메뉴 CRUD, 품절 토글, 순서 변경)
- [ ] ImageController (이미지 업로드/삭제)

#### 6.7 초기 데이터
- [ ] data.sql 작성 (카테고리, 샘플 메뉴)

---

## 7. 개발 순서

```
Step 1: 프로젝트 설정
├── build.gradle 의존성 추가
├── application.properties 설정
├── WebConfig (CORS)
└── GlobalExceptionHandler

Step 2: 엔티티 & Repository
├── Category 엔티티 + Repository
├── Menu 엔티티 + Repository
├── MenuImage 엔티티 + Repository
├── MenuOption + OptionItem 엔티티
└── 연관관계 매핑

Step 3: DTO 구현
├── Request DTOs
├── Response DTOs
└── ApiResponse 래퍼

Step 4: 카테고리 API
├── CategoryService
├── CategoryController
└── 테스트

Step 5: 메뉴 API
├── MenuService
├── MenuController
├── 검색/필터링
├── 품절 토글
├── 순서 변경
└── 테스트

Step 6: 이미지 API
├── ImageService
├── ImageController
├── 파일 저장 로직
└── 테스트

Step 7: 초기 데이터 & 통합 테스트
├── data.sql 작성
├── 프론트엔드 연동 테스트
└── API 문서화 (선택)
```

---

## 8. 실행 명령어

```bash
# 개발 서버 실행
cd backend
./gradlew bootRun

# 빌드
./gradlew build

# 테스트
./gradlew test

# clean 빌드
./gradlew clean build
```

---

## ✅ 승인 체크리스트

아래 항목을 확인해주세요:

- [ ] Spring Boot 4.0 + Java 21 사용 동의
- [ ] JPA + H2(개발)/MySQL(운영) 데이터베이스 동의
- [ ] RESTful API 설계 동의
- [ ] 엔티티 구조 동의
- [ ] Phase 1 백엔드 개발 범위 동의

> 💬 수정이 필요한 부분이 있으면 알려주세요!
