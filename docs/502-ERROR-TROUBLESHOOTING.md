# 502 Bad Gateway 트러블슈팅

리버스 프록시(Nginx, Caddy 등) 뒤에서 NCafe를 운영할 때 502가 날 경우 점검할 항목입니다.

---

## 1. 502가 나는 이유 (요약)

- **프록시 → 백엔드/프론트** 요청이 실패할 때 502를 반환합니다.
- 즉, **프록시는 살아 있는데, 뒤쪽 앱(Next.js 또는 Spring Boot)이 응답하지 않거나 연결이 끊긴 경우**입니다.

---

## 2. 확인 순서

### 2-1. 컨테이너가 떠 있는지

```bash
cd /path/to/ncafe   # runner 워크스페이스 또는 배포 경로
docker compose ps
```

- `backend`, `frontend`가 **Up**인지 확인.
- `Exit` 또는 재시작 반복이면 로그 확인: `docker compose logs backend`, `docker compose logs frontend`.

### 2-2. 포트가 열려 있는지

- `docker-compose.yml`에서 `ports:`가 주석이면, **호스트에서 직접** backend(8011), frontend(3011)에 접속할 수 없을 수 있음.
- 리버스 프록시가 **같은 호스트**에서 돌면 `localhost:3011`, `localhost:8011`로 프록시 설정했는지 확인.
- **다른 서버**에서 프록시를 쓰면, Docker 서비스에 포트를 노출했는지 확인:

```yaml
# docker-compose.yml 예시
services:
  backend:
    ports:
      - "${BACKEND_PORT:-8011}:8011"
  frontend:
    ports:
      - "${FRONTEND_PORT:-3011}:3011"
```

### 2-3. 백엔드(Spring Boot)만 502일 때

- **DB 연결**: `SPRING_DATASOURCE_URL`, `DB_PASSWORD` 등이 맞는지. DB 컨테이너가 먼저 준비되었는지(`depends_on`, healthcheck).
- **로그**:
  ```bash
  docker compose logs backend --tail 100
  ```
  - `Connection refused` → DB/호스트/포트 오류.
  - `BindException: Address already in use` → 8011 포트 충돌.
- **프록시 설정**: `proxy_pass http://127.0.0.1:8011`(또는 backend 컨테이너 네트워크)가 맞는지, 타임아웃이 너무 짧지 않은지.

### 2-4. 프론트(Next.js)만 502일 때

- **백엔드 URL**: 프론트가 BFF/API 호출 시 `API_BASE_URL`이 프록시/백엔드 주소와 맞는지(같은 호스트면 `http://backend:8011` 또는 `http://127.0.0.1:8011`).
- **로그**:
  ```bash
  docker compose logs frontend --tail 100
  ```
- **리버스 프록시**: Next.js로 가는 `proxy_pass`가 3011로 올바르게 가는지 확인.

### 2-5. 리버스 프록시 설정

- **upstream**이 실제로 응답하는 주소/포트인지(예: `127.0.0.1:3011`, `127.0.0.1:8011`).
- **타임아웃**이 짧으면 502가 날 수 있음. `proxy_connect_timeout`, `proxy_read_timeout` 등 증가.
- **HTTPS**만 쓰고 백엔드는 HTTP면, `proxy_pass`는 `http://`로 두는지 확인.

---

## 3. 자주 쓰는 명령어

| 목적 | 명령어 |
|------|--------|
| 컨테이너 상태 | `docker compose ps` |
| 백엔드 로그 | `docker compose logs backend -f` |
| 프론트 로그 | `docker compose logs frontend -f` |
| DB 로그 | `docker compose logs db -f` |
| 재시작 | `docker compose restart backend` 또는 `frontend` |
| 전체 재기동 | `docker compose down && docker compose up -d` |

---

## 4. 체크리스트 요약

- [ ] `docker compose ps`로 backend, frontend Up 확인
- [ ] backend/frontend 포트(8011, 3011)가 호스트에 노출되어 있는지(또는 프록시와 같은 네트워크인지)
- [ ] 리버스 프록시의 `proxy_pass` 주소/포트가 실제 서비스와 일치하는지
- [ ] DB 비밀번호·URL 등 환경 변수가 올바른지
- [ ] `docker compose logs`로 에러 메시지 확인

이 문서는 `docs/` 에 두고, 502 발생 시 위 순서대로 확인하면 됩니다.
