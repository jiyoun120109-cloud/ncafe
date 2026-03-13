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
