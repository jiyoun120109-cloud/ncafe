import asyncio
import json
import threading

from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse

from app.config import RAG_DATABASE_URL
from app.models.schemas import ChatRequest, Message
from app.services import gemini
from app.services import backend_client


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


def resolve_tools(tools: list[dict]) -> tuple[list[dict], list[dict]]:
    """
    도구 응답을 해석해 클라이언트용으로 보강.
    - add_to_cart: menuName → backend에서 메뉴 조회 후 menuId 추가
    - search_menu: backend에서 메뉴 검색 후 searchResults 반환
    반환: (resolved_tools, search_results_list)
    """
    resolved = []
    search_results: list[dict] = []

    for t in tools:
        name = t.get("name") or ""
        args = dict(t.get("args") or {})

        if name == "add_to_cart":
            menu_name = args.get("menuName") or ""
            if menu_name:
                found = backend_client.find_menu_by_name(menu_name)
                if found:
                    args["menuId"] = found.get("id")
                    args["menuName"] = found.get("korName") or found.get("engName") or found.get("name") or menu_name
            # 수량·온도 정규화 (프론트 전달용)
            try:
                args["quantity"] = max(1, int(args.get("quantity") or 1))
            except (TypeError, ValueError):
                args["quantity"] = 1
            temp = (args.get("temperature") or "HOT").upper()
            args["temperature"] = "ICED" if temp == "ICED" else "HOT"
            args["decaf"] = args.get("decaf") is True
            resolved.append({"name": name, "args": args})

        elif name == "search_menu":
            query = args.get("query") or ""
            menus = backend_client.fetch_menus(query)[:10]
            search_results.extend(menus)
            resolved.append({"name": name, "args": {**args, "count": len(menus)}})

        else:
            resolved.append({"name": name, "args": args})

    return (resolved, search_results)


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
            content, tools = gemini.chat_with_tools(gemini_messages, rag_context=rag_context)
            resolved_tools, search_results = resolve_tools(tools)
            out = {"content": content or ""}
            if resolved_tools:
                out["tools"] = resolved_tools
            if search_results:
                out["searchResults"] = search_results
            return out
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e

    async def event_stream():
        loop = asyncio.get_event_loop()
        q = asyncio.Queue()

        def producer():
            try:
                content, tools = gemini.chat_with_tools(gemini_messages, rag_context=rag_context)
                resolved_tools, search_results = resolve_tools(tools)
                for ch in (content or ""):
                    if ch:
                        asyncio.run_coroutine_threadsafe(q.put(("content", ch)), loop).result()
                if resolved_tools:
                    asyncio.run_coroutine_threadsafe(
                        q.put(("payload", {"tools": resolved_tools, "searchResults": search_results or []})),
                        loop,
                    ).result()
                nav = next((t for t in (resolved_tools or []) if t.get("name") == "navigate_to_page"), None)
                if nav and nav.get("args", {}).get("path"):
                    asyncio.run_coroutine_threadsafe(
                        q.put(("payload", {"action": "navigate", "url": nav["args"]["path"]})),
                        loop,
                    ).result()
            except Exception as e:
                asyncio.run_coroutine_threadsafe(q.put(("error", str(e))), loop).result()
            asyncio.run_coroutine_threadsafe(q.put((None, None)), loop).result()

        threading.Thread(target=producer, daemon=True).start()

        while True:
            kind, value = await q.get()
            if kind is None:
                break
            if kind == "error":
                yield {"data": json.dumps({"error": value}, ensure_ascii=False)}
                break
            if kind == "content":
                yield {"data": json.dumps({"content": value}, ensure_ascii=False)}
            if kind == "payload":
                yield {"data": json.dumps(value, ensure_ascii=False)}
        yield {"data": "[DONE]"}

    return EventSourceResponse(
        event_stream(),
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
        },
    )
