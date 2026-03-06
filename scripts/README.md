# 스크립트

## backup-uploads.sh

업로드 디렉터리(`~/upload` 또는 `UPLOAD_DIR`)를 tar.gz로 백업하고, 30일 지난 백업을 삭제합니다.

### 서버에 설치

```bash
# 예: yun 사용자, 백업 경로 /home/yun/upload
cp scripts/backup-uploads.sh ~/
chmod +x ~/backup-uploads.sh
```

### 수동 실행

```bash
~/backup-uploads.sh
```

### Crontab 등록 (매일 새벽 3시)

```bash
crontab -e
```

아래 한 줄 추가:

```
# 매일 새벽 3시 백업
0 3 * * * /home/yun/backup-uploads.sh
```

경로는 실제 스크립트 위치로 바꾸세요 (예: `/home/newlec/backup-uploads.sh`).

### 환경변수 (선택)

- `UPLOAD_DIR`: 백업할 디렉터리 (기본: `$HOME/upload`)
- `BACKUP_DIR`: 백업 파일을 저장할 디렉터리 (기본: `$HOME`)
