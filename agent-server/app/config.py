import os
from pathlib import Path

from dotenv import load_dotenv

# 실행 위치와 무관하게 agent-server/.env 로드 (config.py 기준 상위 디렉터리)
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# RAG: PostgreSQL + pgvector (임베딩 저장). 미설정 시 메모리 스토어 사용.
RAG_DATABASE_URL = os.getenv("RAG_DATABASE_URL", "").strip()

# 백엔드 API (메뉴 검색/담기 시 메뉴 목록 조회용). 미설정 시 도구에서 메뉴 조회 불가.
BACKEND_BASE = os.getenv("BACKEND_BASE", os.getenv("BACKEND_URL", "http://localhost:8011")).strip().rstrip("/")
