# 배포 시 주의사항 (다른 서버에서 pull 후 배포)

## 1. 배포 서버에서 할 일

### 1) 환경 변수 (필수)
- **로컬**: `.env` 없이 실행하면 DB 비밀번호는 기본값(`new_ibm2`)으로 동작합니다.
- **배포 서버**: 반드시 `.env`를 만들어 비밀번호를 설정하세요.

```bash
cp .env.example .env
# .env를 열어 POSTGRES_PASSWORD 등을 실제 값으로 수정
```

| 항목 | 설명 | 예시 |
|------|------|------|
| **POSTGRES_PASSWORD** | DB 비밀번호 (backend·db 공통). `.env`에 넣으면 docker-compose가 사용 | 배포용 강한 비밀번호 |
| **NEXT_PUBLIC_API_URL** | 사용자가 접속하는 프론트 주소 (브라우저용). **빌드 시** `frontend.build.args`에 전달 | `https://your-domain.com` |
| **JWT_SECRET** | 백엔드 JWT 서명 키 (32자 이상). `.env`에 넣으면 backend 서비스에 전달 (선택) | 32자 이상 랜덤 |
| **SESSION_SECRET** | BFF 세션 암호화. 프론트는 `frontend/.env.local` 등에서 설정 (선택) | 32자 이상 |

### 2) 프론트엔드 빌드 시 URL
`NEXT_PUBLIC_*`는 **빌드 시점**에 박히므로, 다른 도메인으로 서비스할 경우 **반드시 빌드 시** 넘겨야 합니다.

```bash
# 방법 1: 빌드 시 인자로 전달
docker compose build frontend --build-arg NEXT_PUBLIC_API_URL=https://실제도메인

# 방법 2: docker-compose.yml의 frontend.build.args 를 해당 서버 도메인으로 수정 후 build
```

### 3) DB 데이터
- `data/`는 Git에 없고, 볼륨으로만 사용합니다.
- 새 서버에서 처음 `docker compose up` 하면 `data/`가 생성되고, `data.sql`로 초기 데이터가 들어갑니다.
- 기존 DB를 옮길 계획이면, 마이그레이션/덤프 방식은 별도로 준비해야 합니다.

### 4) 이미지 파일
- `backend/upload/` 안에 메뉴 이미지가 있어야 합니다.
- Git에 이미지까지 포함해 두었으면 pull 만으로 됩니다.
- 포함하지 않았으면, 배포 서버의 `backend/upload/`에 파일을 넣거나, Dockerfile의 시드 복사 로직으로 빌드 시 포함된 이미지가 첫 기동 시 복사되도록 되어 있습니다.

---

## 2. 배포 순서 요약

1. `git pull`
2. **`.env` 생성**: `cp .env.example .env` 후 `POSTGRES_PASSWORD` 등 실제 값으로 수정 (Docker Compose가 프로젝트 루트 `.env`를 자동 로드)
3. **다른 도메인 사용 시**: `docker-compose.yml`의 `frontend.build.args`에서 `NEXT_PUBLIC_API_URL`를 해당 도메인으로 수정
4. `docker compose build --no-cache` (프론트 URL을 바꿨으면 반드시 재빌드)
5. `docker compose up -d`
6. `data/` 권한 오류 시: `sudo chown -R $USER data`

---

## 3. 보안 체크 (배포 서버)

- [ ] `.env`에 `POSTGRES_PASSWORD`를 기본값이 아닌 강한 비밀번호로 설정했는지
- [ ] (권장) `.env`에 `JWT_SECRET`을 32자 이상 랜덤 값으로 설정했는지
- [ ] HTTPS 사용 시 `SESSION_SECRET` 설정 및 쿠키 secure 옵션 확인
