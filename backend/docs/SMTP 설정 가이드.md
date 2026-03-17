# SMTP 설정 가이드 (비밀번호 초기화 이메일 발송)

관리자 회원관리에서 비밀번호 초기화 후 "전달"을 누르면, 해당 회원 이메일로 새 비밀번호가 발송됩니다.  
SMTP를 설정하지 않으면 **알림만** 동작하고 이메일은 발송되지 않습니다.

---

## 1. 설정 항목

| 항목 | 환경변수 | application.properties 키 | 설명 |
|------|----------|----------------------------|------|
| SMTP 서버 | `SPRING_MAIL_HOST` | `spring.mail.host` | smtp.gmail.com, smtp.naver.com 등 |
| 포트 | `SPRING_MAIL_PORT` | `spring.mail.port` | 보통 **587** (TLS) 또는 465 (SSL) |
| 로그인 이메일 | `SPRING_MAIL_USERNAME` | `spring.mail.username` | SMTP 로그인용 이메일 |
| 비밀번호 | `SPRING_MAIL_PASSWORD` | `spring.mail.password` | 비밀번호 또는 **앱 비밀번호** |
| 발신 주소 | `APP_MAIL_FROM` | `app.mail.from` | (선택) 비우면 username 사용 |
| 이메일 발송 사용 | `APP_MAIL_SEND_ENABLED` | `app.mail.send-enabled` | **true** 로 설정 시에만 실제 발송 (미설정 시 알림만) |

- 위 SMTP 항목을 채우고 **app.mail.send-enabled=true** 로 두면 이메일 발송
- 비우거나 send-enabled 를 쓰지 않으면 이메일 발송 없음, 알림·비밀번호 초기화는 정상 동작

---

## 2. 로컬에서 설정 (application-local.properties)

1. `src/main/resources/application-local.properties` 파일 생성  
   (이 파일은 `.gitignore` 되어 있어 비밀번호를 넣어도 커밋되지 않음)

2. 아래 중 사용할 서비스에 맞게 입력

**Gmail**
```properties
app.mail.send-enabled=true
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your@gmail.com
spring.mail.password=앱비밀번호16자
app.mail.from=your@gmail.com
```
- Google 계정 **2단계 인증** 사용 후, **보안 → 앱 비밀번호**에서 생성한 16자 입력

**Naver**
```properties
app.mail.send-enabled=true
spring.mail.host=smtp.naver.com
spring.mail.port=587
spring.mail.username=your@naver.com
spring.mail.password=네이버비밀번호
app.mail.from=your@naver.com
```

3. 실행 시 `local` 프로필 사용  
   - IDE: Run Configuration에서 Active profile = `local`  
   - 터미널: `SPRING_PROFILES_ACTIVE=local ./gradlew bootRun`

---

## 3. 서버 / Docker에서 설정 (환경변수)

```bash
APP_MAIL_SEND_ENABLED=true
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your@gmail.com
SPRING_MAIL_PASSWORD=앱비밀번호
APP_MAIL_FROM=your@gmail.com
```

docker-compose 사용 시 `environment:` 또는 `.env` 파일에 위 변수를 넣으면 됩니다.

**prod 프로필 사용 시:** `application-prod.properties` 에서 `MailSenderAutoConfiguration` exclude 한 줄을 제거한 뒤 위 환경변수를 설정해야 이메일이 발송됩니다. (exclude 유지 시 메일 미사용으로 JavaMailSender가 생성되지 않아 기동이 안정적입니다.)

---

## 4. 구현된 동작 요약

- **회원관리 > 수정** → 비밀번호 초기화 → 확인 모달 **전달** 클릭 시  
  - 앱 내 알림 생성  
  - 회원 이메일이 있으면 해당 주소로 **초기화된 비밀번호** 이메일 발송  
- 회원 이메일이 없으면 이메일만 생략, 알림·비밀번호 변경은 그대로 적용  
- 발송 실패 시 로그만 남기고 비밀번호 초기화/알림은 성공 처리

설정은 나중에 해도 되며, 비워 두면 이메일 없이 알림만 동작합니다.
