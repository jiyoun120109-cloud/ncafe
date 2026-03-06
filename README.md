# ncafe

## 실행 방법

### Docker Compose (로컬·배포 동일)

프로젝트 루트 `.env`에 `GEMINI_API_KEY`(AI 채팅용), `DB_PASSWORD` 등 설정 후:

```bash
docker compose up -d
```

| 서비스        | 접속 (로컬)              |
|---------------|---------------------------|
| Frontend      | http://localhost:3011     |
| Backend       | http://localhost:8011     |
| Agent (AI 채팅) | http://localhost:8000   |
| DB            | localhost:5511            |

BFF(프론트)는 백엔드(`API_BASE_URL=http://backend:8011`), AI 채팅(`AGENT_SERVER_URL=http://agent-server:8000`)을 컨테이너 내부 주소로 호출한다.

### 로컬 실행 (호스트에서 프론트만 띄울 때)

- **Docker**에서 돌릴 때: BFF는 컨테이너 안에서 `backend:8011`, `agent-server:8000`으로 접속한다. (docker-compose가 env로 넣어 줌.)
- **호스트**에서 `npm run dev`로 프론트만 띄울 때: BFF는 내 PC에서 실행되므로 `backend` / `agent-server` 호스트명을 쓸 수 없다. 백엔드·에이전트가 **같은 PC**에서 8011, 8000으로 떠 있다면 `localhost:8011`, `localhost:8000`으로 설정해야 한다.

**절차**

1. **DB·백엔드·에이전트를 먼저 띄운다.**  
   `npm run dev`는 **프론트만** 켠다. DB·백엔드·에이전트는 따로 실행해야 한다 (예: `docker compose up -d db backend agent-server` 또는 각각 로컬 실행).

2. **프론트 env**  
   `frontend/.env.local`에 아래를 넣는다. (Next.js는 `frontend` 디렉터리의 `.env.local`을 읽는다.)

   ```env
   PORT=3011
   API_BASE_URL=http://localhost:8011
   AGENT_SERVER_URL=http://localhost:8000
   NEXT_PUBLIC_APP_URL=http://localhost:3011
   ```

   - `PORT=3011` — 프론트 포트  
   - `API_BASE_URL`, `AGENT_SERVER_URL` — 호스트에서 띄운 BFF가 백엔드/에이전트를 부를 주소 (같은 PC면 localhost)  
   - `NEXT_PUBLIC_APP_URL` — 서버사이드에서 BFF 주소로 쓸 값 (로컬 3011 쓰면 `http://localhost:3011` 권장)

3. **프론트 실행**

   ```bash
   cd frontend
   npm run dev
   ```

   → http://localhost:3011 로 접속.

프로젝트 루트 `.env`는 `cp .env.example .env` 후 값 채우기. Docker만 쓸 때는 루트 `.env`로 충분하다.