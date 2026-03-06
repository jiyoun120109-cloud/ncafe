#!/bin/bash
# NCafe 업로드 디렉터리 백업 (이미지 등)
# 사용: 서버에서 이 스크립트를 홈 등에 복사 후 crontab 등록

UPLOAD_DIR="${UPLOAD_DIR:-$HOME/upload}"
BACKUP_DIR="${BACKUP_DIR:-$HOME}"
DATE=$(date +%Y%m%d_%H%M%S)
ARCHIVE="$BACKUP_DIR/upload-backup-$DATE.tar.gz"

if [ ! -d "$UPLOAD_DIR" ]; then
  echo "[$(date)] skip: $UPLOAD_DIR not found"
  exit 0
fi

tar -czf "$ARCHIVE" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")"
echo "[$(date)] created $ARCHIVE"

# 오래된 백업 삭제 (30일 이상)
find "$BACKUP_DIR"/upload-backup-*.tar.gz -mtime +30 -delete 2>/dev/null || true
