import asyncio
import json

from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse

from app.models.schemas import ChatRequest, Message
from app.services import gemini


def to_gemini_messages(messages: list[Message]) -> list[dict]:
    return [
        {"role": m.role, "parts": [{"text": m.content}]}
        for m in messages
    ]


router = APIRouter()


@router.post("/chat")
async def post_chat(body: ChatRequest):
    if not body.messages:
        raise HTTPException(status_code=400, detail="messages is required")

    try:
        gemini_messages = to_gemini_messages(body.messages)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    try:
        if not body.stream:
            content = gemini.chat(gemini_messages)
            return {"content": content}
    except ValueError as e:
        # GEMINI_API_KEY 미설정 등
        raise HTTPException(status_code=503, detail=str(e)) from e

    async def event_stream():
        try:
            for token in gemini.chat_stream(gemini_messages):
                yield {"data": json.dumps({"content": token})}
                await asyncio.sleep(0)
            yield {"data": "[DONE]"}
        except ValueError as e:
            yield {"data": json.dumps({"error": str(e)})}

    return EventSourceResponse(event_stream())
