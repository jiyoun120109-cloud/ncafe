from __future__ import annotations

from collections.abc import Generator
from typing import Any

from google import genai
from google.genai import types

from app.config import GEMINI_API_KEY, GEMINI_MODEL

_client: genai.Client | None = None

# NCafe 챗봇 역할 + 도구 사용 지침
SYSTEM_INSTRUCTION = """You are a cute, slightly playful assistant for NCafe (a cafe for coffee and brunch).
Always reply in Korean only. Keep each answer short—avoid long run-on sentences.
Format with real line breaks: start a new line after each sentence or idea so each thought is on its own line. Do not write long paragraphs in one line.
Be warm and friendly with a tiny bit of playfulness; not stiff or formal. Emojis are okay in moderation.
Help with menu recommendations, business hours, and general cafe questions. If you don't know something, say so kindly and suggest contacting the store.

**도구 사용 규칙 (필수):**
- 사용자가 **어떤 페이지로 이동**해 달라고 하면 반드시 **navigate_to_page** 도구를 사용하라. 되묻지 말고 바로 도구를 호출하고, 텍스트 응답은 "{페이지명}으로 이동할게요!"처럼 짧게만 적어라. (예: "메뉴로 이동할게요!", "공지사항으로 이동할게요!") path에는 사이트 내 경로만 넣어라. 예: 메뉴·메뉴 목록·메뉴 보여줘 → /menus, 장바구니 → /cart, 주문 → /order, 결제 → /payment, 공지사항 → /notices, 1:1문의/문의하기 → /inquiries, 마이페이지 → /user, 즐겨찾기 → /favorites, 로그인 → /login, 회원가입 → /signup, 홈/메인 → /. 상세 페이지(예: 공지 N번)는 /notices, /inquiries 등 목록 경로로 이동.
- 사용자가 특정 메뉴를 "장바구니에 담아줘", "아이스 카페라떼 디카페인 2잔 담아줘" 등 **담기**를 요청하면 **add_to_cart** 도구를 사용하라. menuName에는 메뉴 이름만(아메리카노, 카페라떼 등). quantity에는 말한 잔 수 그대로(2잔→2, 1잔→1, 미언급→1). temperature는 "ICED"(아이스/ICE) 또는 "HOT"(핫/따뜻한/미언급). decaf는 디카페인/decaf 요청이 있으면 true, 없으면 false. 이때 **텍스트 응답**에는 반드시 주문 내용을 요약해서 확인시켜 주고, "아래 담기 버튼을 눌러주시거나 '담아줘'라고 말해주세요"처럼 안내하라. 예: "아이스 카페라떼 디카페인 2잔 담을게요. 맞으면 아래 담기 버튼을 눌러주세요!"
- 사용자가 "○○ 검색해줘", "○○ 메뉴 찾아줘", "○○ 있어?" 등 **메뉴 검색**을 요청하면 **search_menu** 도구를 사용하라. query에 검색어를 넣어라.
- 위 세 가지 의도가 있으면 반드시 해당 도구를 호출하고, 짧은 안내 문구만 텍스트로 보충하라. 도구가 없으면 일반 대화로 답하라."""


# Gemini function calling용 도구 정의
NAVIGATE_TO_PAGE = types.FunctionDeclaration(
    name="navigate_to_page",
    description="사용자를 사이트 내 지정한 페이지로 이동시킵니다. 모든 사용자 페이지 경로 사용 가능.",
    parameters={
        "type": "object",
        "properties": {
            "path": {
                "type": "string",
                "description": "이동할 경로(반드시 /로 시작). 사용 가능 경로: /(홈), /menus(메뉴), /cart(장바구니), /order(주문), /payment(결제), /notices(공지사항), /inquiries(1:1문의), /user(마이페이지), /favorites(즐겨찾기), /login(로그인), /signup(회원가입). 위에 없는 이동 요청도 이 경로들 중 가장 가까운 것으로 매핑하라.",
            },
            "label": {
                "type": "string",
                "description": "사용자에게 보여줄 페이지 이름. 예: 메뉴, 장바구니, 공지사항, 마이페이지.",
            },
        },
        "required": ["path"],
    },
)

ADD_TO_CART = types.FunctionDeclaration(
    name="add_to_cart",
    description="사용자가 요청한 메뉴를 장바구니에 담습니다. 메뉴 이름, 수량, 온도(아이스/핫), 디카페인 여부를 반드시 반영합니다.",
    parameters={
        "type": "object",
        "properties": {
            "menuName": {
                "type": "string",
                "description": "담을 메뉴 이름만. 예: 아메리카노, 카페라떼. '아이스 카페라떼 디카페인'이면 menuName은 카페라떼.",
            },
            "quantity": {
                "type": "integer",
                "description": "잔 수. 2잔이면 2, 1잔이면 1. 미언급이면 1.",
            },
            "temperature": {
                "type": "string",
                "enum": ["HOT", "ICED"],
                "description": "아이스/ICE → ICED, 뜨거운/핫/미언급 → HOT.",
            },
            "decaf": {
                "type": "boolean",
                "description": "디카페인으로 담을 경우 true, 아니면 false.",
            },
        },
        "required": ["menuName"],
    },
)

SEARCH_MENU = types.FunctionDeclaration(
    name="search_menu",
    description="메뉴를 검색합니다. 사용자가 검색어를 주면 해당하는 메뉴 목록을 보여줍니다.",
    parameters={
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "검색어. 예: 라떼, 아메리카노"},
        },
        "required": ["query"],
    },
)

CHAT_TOOLS = types.Tool(
    function_declarations=[NAVIGATE_TO_PAGE, ADD_TO_CART, SEARCH_MENU],
)


def _client_get() -> genai.Client:
    global _client
    if not (GEMINI_API_KEY and GEMINI_API_KEY.strip()):
        raise ValueError("GEMINI_API_KEY is not set. Set it in .env or environment.")
    if _client is None:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


def _to_contents(
    messages: list[dict],
) -> list[types.Content]:
    return [
        types.Content(
            role=m["role"],
            parts=[types.Part.from_text(text=m["parts"][0]["text"])],
        )
        for m in messages
    ]


def _config(rag_context: str | None = None, with_tools: bool = False) -> types.GenerateContentConfig:
    instruction = SYSTEM_INSTRUCTION
    if rag_context and rag_context.strip():
        instruction = (
            instruction
            + "\n\n[아래 참고 자료를 우선 반영하여 답변해 주세요. 자료에 없는 내용은 모른다고 말하고 매장 문의를 권하세요.]\n\n"
            + rag_context.strip()
        )
    config = types.GenerateContentConfig(system_instruction=instruction)
    if with_tools:
        config = types.GenerateContentConfig(
            system_instruction=instruction,
            tools=[CHAT_TOOLS],
        )
    return config


def _extract_tools_from_response(response: Any) -> tuple[str, list[dict[str, Any]]]:
    """응답에서 텍스트와 도구 호출 목록을 추출. (content, tools)."""
    text_parts: list[str] = []
    tools: list[dict[str, Any]] = []

    if getattr(response, "candidates", None):
        cand = response.candidates[0]
        content = getattr(cand, "content", None)
        parts = getattr(content, "parts", None) or []
        for part in parts:
            if getattr(part, "text", None):
                text_parts.append(part.text)
            fc = getattr(part, "function_call", None)
            if fc:
                name = getattr(fc, "name", None) or ""
                args = dict(getattr(fc, "args", None) or {})
                tools.append({"name": name, "args": args})

    content_text = "\n".join(text_parts).strip() if text_parts else ""
    if not content_text and getattr(response, "text", None):
        content_text = (response.text or "").strip()
    return (content_text, tools)


def chat_with_tools(
    messages: list[dict],
    rag_context: str | None = None,
) -> tuple[str, list[dict[str, Any]]]:
    """도구를 사용하는 채팅. (content, tools) 반환. 도구 호출이 있으면 클라이언트가 실행."""
    client = _client_get()
    contents = _to_contents(messages)
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=contents,
        config=_config(rag_context=rag_context, with_tools=True),
    )
    return _extract_tools_from_response(response)


def chat(messages: list[dict], rag_context: str | None = None) -> str:
    client = _client_get()
    contents = _to_contents(messages)
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=contents,
        config=_config(rag_context=rag_context),
    )
    return response.text or ""


def chat_stream(messages: list[dict], rag_context: str | None = None) -> Generator[str, None, None]:
    client = _client_get()
    contents = _to_contents(messages)
    for chunk in client.models.generate_content_stream(
        model=GEMINI_MODEL,
        contents=contents,
        config=_config(rag_context=rag_context),
    ):
        if chunk.text:
            yield chunk.text
