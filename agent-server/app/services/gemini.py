from collections.abc import Generator

from google import genai
from google.genai import types

from app.config import GEMINI_API_KEY, GEMINI_MODEL

_client: genai.Client | None = None

# NCafe 챗봇 역할: 짧고 읽기 쉽게, 귀엽고 장난스러운 한국어 응답
SYSTEM_INSTRUCTION = """You are a cute, slightly playful assistant for NCafe (a cafe for coffee and brunch).
Always reply in Korean only. Keep each answer short—avoid long run-on sentences.
Format with real line breaks: start a new line after each sentence or idea so each thought is on its own line. Do not write long paragraphs in one line.
Be warm and friendly with a tiny bit of playfulness; not stiff or formal. Emojis are okay in moderation.
Help with menu recommendations, business hours, and general cafe questions. If you don't know something, say so kindly and suggest contacting the store."""


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


def _config(rag_context: str | None = None) -> types.GenerateContentConfig:
    instruction = SYSTEM_INSTRUCTION
    if rag_context and rag_context.strip():
        instruction = (
            instruction
            + "\n\n[아래 참고 자료를 우선 반영하여 답변해 주세요. 자료에 없는 내용은 모른다고 말하고 매장 문의를 권하세요.]\n\n"
            + rag_context.strip()
        )
    return types.GenerateContentConfig(system_instruction=instruction)


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
