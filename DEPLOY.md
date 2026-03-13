# 배포 전 점검 (Deploy Checklist)

## 1. GitHub 설정

### Variables (Settings → Secrets and variables → Actions → **Variables**)
| 이름 | 설명 | 예시 |
|------|------|------|
| `COMPOSE_PROJECT_NAME` | Docker Compose 프로젝트 이름 | `yun_ncafe` |
| `USER_ID` | 컨테이너 이름 접두사 | `yun` |
| `FRONTEND_PORT` | 프론트엔드 노출 포트 | `3011` |
| `NEXT_PUBLIC_API_URL` | **배포 도메인** (프론트/API 공용) | `https://eunami.newlecture.com` |

### Secrets (Settings → Secrets and variables → Actions → **Secrets**)
| 이름 | 설명 |
|------|------|
| `SESSION_SECRET` | BFF 세션 암호화 키 |
| `JWT_SECRET` | 백엔드 JWT 서명 키 |
| `DB_PASSWORD` | PostgreSQL 비밀번호 (ncafe 사용자) |
| `GEMINI_API_KEY` | AI 채팅(Gemini) API 키 |
| `NEXT_PUBLIC_KAKAO_MAP_APP_KEY` | 카카오맵 JavaScript 키 (위치 페이지) |
| `NEXT_PUBLIC_PORTONE_STORE_ID` | 포트원 상점 ID (결제 위젯) |
| `NEXT_PUBLIC_PORTONE_PG` | 포트원 PG 코드 (예: `nice_v2.iamport03m`) |
| `PORTONE_API_KEY` | 포트원 API 키 (백엔드 결제 검증) |
| `PORTONE_API_SECRET` | 포트원 API 시크릿 (백엔드 결제 검증) |

## 2. 배포 서버(호스트) 준비

- **Docker / Docker Compose** 설치
- **GitHub Actions Runner** (self-hosted) 등록 후 `runs-on: self-hosted` 동작 확인
- 볼륨 경로: `docker-compose.yml`에 `/home/yun/upload`, `/home/yun/data` 사용.  
  다른 경로를 쓰려면 compose의 `volumes`를 수정한 뒤, 워크플로의 "Ensure host volume directories" 단계도 해당 경로로 맞출 것.

## 3. 외부 서비스 도메인 등록

- **카카오 개발자 콘솔**: 앱 키 → Web 플랫폼 → 사이트 도메인에 **배포 URL** 등록 (예: `https://eunami.newlecture.com`)
- **포트원 콘솔**: 결제 사용 도메인 등록

## 4. 배포 실행

- `main` 브랜치 push 또는 **Actions → Deploy → Run workflow** (workflow_dispatch)
- 배포 후: `http://서버IP:FRONTEND_PORT` 또는 리버스 프록시로 `NEXT_PUBLIC_API_URL` 도메인 접속 확인

## 5. 추가/수정된 워크플로 내용

- 호스트 볼륨 디렉터리 생성 단계 추가: `/home/yun/upload`, `/home/yun/data` (최초 배포 시 컨테이너 기동 실패 방지)
- 상단 주석에 Variables / Secrets 구분 정리

## 6. 트러블슈팅

### DB 로그: collation version mismatch

PostgreSQL 로그에 `database "ncafedb" has a collation version mismatch` (2.41 vs 2.36) 가 나오는 경우, 호스트/이미지의 glibc 로케일 버전이 DB 생성 시와 다를 때 발생합니다.

**조치(배포 서버에서 한 번만 실행):**

```bash
# DB 컨테이너에 접속 후
docker exec -it <db컨테이너이름> psql -U ncafe -d ncafedb -c "ALTER DATABASE ncafedb REFRESH COLLATION VERSION;"
```

실행 후 DB(또는 postgres 프로세스) 재시작이 필요할 수 있습니다. 문제가 계속되면 `REINDEX DATABASE ncafedb;` 후 다시 시도하세요.

### 백엔드: Flyway "baselineOnMigrate" / 설정 변경 후에도 같은 에러

설정(`spring.flyway.baseline-on-migrate=true` 등)을 넣었는데도 같은 에러가 나면 **실행 중인 백엔드 이미지가 예전 빌드**일 가능성이 큽니다.

**조치:** 백엔드 이미지를 다시 빌드한 뒤 재기동해야 합니다.

- **GitHub Actions 배포:** 푸시 후 워크플로가 성공했는지 확인. 실패했다면 수정 후 다시 푸시. 성공했는데도 에러면 배포 서버에서 `docker compose build --no-cache backend && docker compose up -d` 실행.
- **배포 서버에서 직접:**  
  `cd <프로젝트경로> && docker compose build --no-cache backend && docker compose up -d`

### 프론트엔드: ECONNREFUSED 172.x.x.x:8011

프론트(BFF)가 백엔드(8011)로 연결할 수 없다는 뜻입니다. **백엔드 컨테이너가 떠 있지 않거나 기동에 실패한 상태**입니다.

1. 컨테이너 상태 확인: `docker compose ps` → backend가 `Up`인지 확인
2. 백엔드 로그 확인: `docker logs <backend컨테이너이름> --tail 150`  
   - DataInitializer(coupons INSERT) 오류가 있으면 최신 코드(data.sql에 `coupons.user_id` nullable 처리) 반영 후 재배포
   - 그 외 스택 트레이스가 있으면 해당 오류 기준으로 수정
3. 백엔드가 정상 기동되면 8011 포트는 Docker 내부에서만 사용되며, 프론트는 같은 네트워크에서 `backend:8011`로 접속하므로 ECONNREFUSED가 사라져야 합니다.
