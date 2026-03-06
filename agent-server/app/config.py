import os
from pathlib import Path

from dotenv import load_dotenv

# 실행 위치와 무관하게 agent-server/.env 로드 (config.py 기준 상위 디렉터리)
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
