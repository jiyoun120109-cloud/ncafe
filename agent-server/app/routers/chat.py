import asyncio
import json

from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse

from app.config import RAG_DATABASE_URL
from app.models.schemas import ChatRequest, Message
from app.services import gemini


def to_gemini_messages(messages: list[Message]) -> list[dict]:
    return [
        {"role": m.role, "parts": [{"text": m.content}]}
        for m in messages
    ]


def get_rag_context(last_user_text: str, top_k: int = 5) -> str | None:
    """마지막 사용자 메시지로 유사 문서 검색 후 참고 문맥 문자열 반환. RAG 미사용 또는 검색 결과 없으면 None."""
    if not RAG_DATABASE_URL or not last_user_text or not last_user_text.strip():
        return None
    try:
        from app.services import embedding as embedding_svc
        from app.services import rag_store
        query_vec = embedding_svc.encode_query(last_user_text.strip())
        docs = rag_store.search_documents(query_vec, top_k=top_k)
        if not docs:
            return None
        parts = []
        for i, d in enumerate(docs, 1):
            title = d.get("title") or f"자료 {i}"
            content = (d.get("content") or "").strip()
            if content:
                parts.append(f"[{title}]\n{content}")
        return "\n\n---\n\n".join(parts) if parts else None
    except Exception:
        return None


router = APIRouter()


@router.post("/chat")
async def post_chat(body: ChatRequest):
    if not body.messages:
        raise HTTPException(status_code=400, detail="messages is required")

    try:
        gemini_messages = to_gemini_messages(body.messages)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    last_user = next((m for m in reversed(body.messages) if m.role == "user"), None)
    rag_context = get_rag_context(last_user.content if last_user else "") if last_user else None

    try:
        if not body.stream:
            content = gemini.chat(gemini_messages, rag_context=rag_context)
            return {"content": content}
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e

    async def event_stream():
        try:
            for token in gemini.chat_stream(gemini_messages, rag_context=rag_context):
                yield {"data": json.dumps({"content": token})}
                await asyncio.sleep(0)
            yield {"data": "[DONE]"}
        except ValueError as e:
            yield {"data": json.dumps({"error": str(e)})}

    return EventSourceResponse(event_stream())
