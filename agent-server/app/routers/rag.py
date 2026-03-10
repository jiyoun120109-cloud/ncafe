"""
RAG 문서 API (Python 처리).
- 문서 전달 시 E5-small 임베딩 후 pgvector DB 저장.
- RAG_DATABASE_URL 미설정 시 메모리 스토어로 동작.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

from app.config import RAG_DATABASE_URL

router = APIRouter()


class DocumentCreate(BaseModel):
    title: str | None = None
    content: str


class DocumentUpdate(BaseModel):
    title: str | None = None
    content: str | None = None


def _use_db() -> bool:
    return bool(RAG_DATABASE_URL)


def _doc_to_response(d: dict) -> dict:
    created = d.get("createdAt") or d.get("created_at")
    if hasattr(created, "isoformat"):
        created = created.isoformat().replace("+00:00", "Z")
    return {
        "id": d["id"],
        "title": d.get("title"),
        "content": d.get("content", ""),
        "createdAt": created,
    }


# RAG_DATABASE_URL 미설정 시 사용하는 메모리 스토어
_store: list[dict] = []
_next_id = 1


@router.get("/documents")
def list_documents():
    """저장된 문서 목록 (임베딩 벡터는 제외)."""
    if _use_db():
        try:
            from app.services import rag_store
            docs = rag_store.list_documents()
            return {"documents": [_doc_to_response(d) for d in docs]}
        except Exception as e:
            import logging
            logging.getLogger(__name__).exception("RAG list_documents failed")
            return {"documents": []}
    return {"documents": [_doc_to_response(d) for d in _store]}


@router.post("/documents")
def create_document(body: DocumentCreate):
    """문서 수신 → 임베딩 → DB 저장."""
    title = (body.title or "").strip() or None
    content = (body.content or "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="content is required")

    if _use_db():
        from app.services import embedding as embedding_svc
        from app.services import rag_store
        try:
            vec = embedding_svc.encode(content)
            doc = rag_store.insert_document(title=title, content=content, embedding=vec)
            return _doc_to_response(doc)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e)) from e

    global _next_id
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    doc = {"id": _next_id, "title": title, "content": content, "createdAt": now}
    _store.append(doc)
    _next_id += 1
    return _doc_to_response(doc)


@router.patch("/documents/{doc_id:int}")
def update_document(doc_id: int, body: DocumentUpdate):
    """문서 수정 (content 변경 시 임베딩 재계산)."""
    if _use_db():
        from app.services import embedding as embedding_svc
        from app.services import rag_store
        title = (body.title or "").strip() or None if body.title is not None else None
        content = (body.content or "").strip() if body.content is not None else None
        embedding = None
        if content is not None:
            try:
                embedding = embedding_svc.encode(content)
            except Exception as e:
                raise HTTPException(status_code=400, detail=str(e)) from e
        doc = rag_store.update_document(doc_id, title=title, content=content or None, embedding=embedding)
        if doc is None:
            raise HTTPException(status_code=404, detail="document not found")
        return _doc_to_response(doc)

    for i, d in enumerate(_store):
        if d["id"] == doc_id:
            if body.title is not None:
                _store[i]["title"] = (body.title or "").strip() or None
            if body.content is not None:
                _store[i]["content"] = (body.content or "").strip()
            return _doc_to_response(_store[i])
    raise HTTPException(status_code=404, detail="document not found")


@router.delete("/documents/{doc_id:int}", status_code=204)
def delete_document(doc_id: int):
    """문서 삭제."""
    if _use_db():
        from app.services import rag_store
        if not rag_store.delete_document(doc_id):
            raise HTTPException(status_code=404, detail="document not found")
        return Response(status_code=204)

    global _store
    for i, d in enumerate(_store):
        if d["id"] == doc_id:
            _store = _store[:i] + _store[i + 1:]
            return Response(status_code=204)
    raise HTTPException(status_code=404, detail="document not found")
