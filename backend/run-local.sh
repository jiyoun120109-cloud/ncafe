#!/bin/sh
# 로컬 bootRun: 프로젝트 루트 .env의 POSTGRES_PASSWORD, POSTGRES_PORT 사용 (Docker DB와 동일하게)
cd "$(dirname "$0")"
if [ -f "../.env" ]; then
  set -a
  . ../.env
  set +a
fi
export SPRING_DATASOURCE_PASSWORD="${SPRING_DATASOURCE_PASSWORD:-${POSTGRES_PASSWORD:-new_ibm2}}"
if [ -n "${POSTGRES_PORT}" ]; then
  export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:${POSTGRES_PORT}/ncafedb"
fi
exec ./gradlew bootRun
