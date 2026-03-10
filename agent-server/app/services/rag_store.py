"""
RAG 문서 pgvector 저장소. RAG_DATABASE_URL 설정 시 사용.
테이블: rag_documents (id, title, content, embedding vector(384), created_at)
"""
from __future__ import annotations

from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Iterator

from app.config import RAG_DATABASE_URL

TABLE = "rag_documents"
VECTOR_DIM = 384


def _get_conn():
    import psycopg2
    conn = psycopg2.connect(RAG_DATABASE_URL)
    return conn


def _init_db(conn) -> None:
    """CREATE EXTENSION vector 먼저 실행 후 커밋. 그 다음 register_vector 호출해야 vector 타입 인식됨."""
    with conn.cursor() as cur:
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    conn.commit()
    with conn.cursor() as cur:
        cur.execute(
            f"""
            CREATE TABLE IF NOT EXISTS {TABLE} (
                id SERIAL PRIMARY KEY,
                title TEXT,
                content TEXT NOT NULL,
                embedding vector({VECTOR_DIM}),
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            """
        )
    conn.commit()


@contextmanager
def _connection() -> Iterator:
    import psycopg2
    from pgvector.psycopg2 import register_vector
    conn = _get_conn()
    try:
        _init_db(conn)
        register_vector(conn)
        yield conn
    finally:
        conn.close()


def list_documents() -> list[dict]:
    with _connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT id, title, content, created_at FROM {TABLE} ORDER BY id"
            )
            rows = cur.fetchall()
    return [
        {
            "id": r[0],
            "title": r[1],
            "content": r[2],
            "createdAt": r[3].isoformat().replace("+00:00", "Z") if r[3] else None,
        }
        for r in rows
    ]


def insert_document(title: str | None, content: str, embedding: list[float]) -> dict:
    from pgvector import Vector
    with _connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"INSERT INTO {TABLE} (title, content, embedding) VALUES (%s, %s, %s) RETURNING id, title, content, created_at",
                (title, content, Vector(embedding)),
            )
            row = cur.fetchone()
        conn.commit()
    return {
        "id": row[0],
        "title": row[1],
        "content": row[2],
        "createdAt": row[3].isoformat().replace("+00:00", "Z") if row[3] else None,
    }


def update_document(
    doc_id: int,
    *,
    title: str | None = None,
    content: str | None = None,
    embedding: list[float] | None = None,
) -> dict | None:
    from pgvector import Vector
    with _connection() as conn:
        with conn.cursor() as cur:
            if embedding is not None:
                cur.execute(
                    f"UPDATE {TABLE} SET title = COALESCE(%s, title), content = %s, embedding = %s WHERE id = %s RETURNING id, title, content, created_at",
                    (title, content, Vector(embedding), doc_id),
                )
            else:
                cur.execute(
                    f"UPDATE {TABLE} SET title = COALESCE(%s, title), content = COALESCE(%s, content) WHERE id = %s RETURNING id, title, content, created_at",
                    (title, content, doc_id),
                )
            row = cur.fetchone()
        conn.commit()
    if not row:
        return None
    return {
        "id": row[0],
        "title": row[1],
        "content": row[2],
        "createdAt": row[3].isoformat().replace("+00:00", "Z") if row[3] else None,
    }


def delete_document(doc_id: int) -> bool:
    with _connection() as conn:
        with conn.cursor() as cur:
            cur.execute(f"DELETE FROM {TABLE} WHERE id = %s", (doc_id,))
            deleted = cur.rowcount
        conn.commit()
    return deleted > 0


def get_document(doc_id: int) -> dict | None:
    with _connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT id, title, content, created_at FROM {TABLE} WHERE id = %s",
                (doc_id,),
            )
            row = cur.fetchone()
    if not row:
        return None
    return {
        "id": row[0],
        "title": row[1],
        "content": row[2],
        "createdAt": row[3].isoformat().replace("+00:00", "Z") if row[3] else None,
    }


def search_documents(query_embedding: list[float], top_k: int = 5) -> list[dict]:
    """유사도 검색: 쿼리 벡터와 코사인 거리로 상위 top_k개 문서 반환 (id, title, content, createdAt)."""
    from pgvector import Vector
    if top_k < 1:
        return []
    with _connection() as conn:
        with conn.cursor() as cur:
            # <=> : 코사인 거리 (작을수록 유사). ORDER BY embedding <=> %s LIMIT n
            cur.execute(
                f"""
                SELECT id, title, content, created_at
                FROM {TABLE}
                ORDER BY embedding <=> %s
                LIMIT %s
                """,
                (Vector(query_embedding), top_k),
            )
            rows = cur.fetchall()
    return [
        {
            "id": r[0],
            "title": r[1],
            "content": r[2],
            "createdAt": r[3].isoformat().replace("+00:00", "Z") if r[3] else None,
        }
        for r in rows
    ]
