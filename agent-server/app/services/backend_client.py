"""백엔드 API 호출 (메뉴 검색 등)."""
from __future__ import annotations

import json
import urllib.error
import urllib.parse
import urllib.request

from app.config import BACKEND_BASE


def fetch_menus(search_query: str | None = None) -> list[dict]:
    """GET /api/menus?searchQuery=... 로 메뉴 목록 조회. 실패 시 빈 리스트."""
    params = ""
    if search_query and str(search_query).strip():
        params = "?" + urllib.parse.urlencode({"searchQuery": str(search_query).strip()})
    url = f"{BACKEND_BASE}/api/menus{params}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            return list(data.get("menus") or data or [])
    except (urllib.error.URLError, json.JSONDecodeError, OSError):
        return []


def find_menu_by_name(menu_name: str) -> dict | None:
    """메뉴 이름(한글/영문)으로 검색해 첫 번째 매칭 메뉴 반환. 없으면 None."""
    if not (menu_name and str(menu_name).strip()):
        return None
    name = str(menu_name).strip()
    menus = fetch_menus(name)
    name_lower = name.lower()
    for m in menus:
        kor = (m.get("korName") or "").strip()
        eng = (m.get("engName") or m.get("name") or "").strip().lower()
        if name in kor or name_lower in eng or (len(name) >= 2 and (name_lower in kor.lower() or name_lower in eng)):
            return m
    if menus:
        return menus[0]
    return None
