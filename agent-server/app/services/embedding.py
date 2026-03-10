"""
E5-small(384차원) 로 텍스트 임베딩. RAG 저장 시 passage prefix 사용.
"""
from __future__ import annotations

MODEL_NAME = "intfloat/multilingual-e5-small"
PASSAGE_PREFIX = "passage: "
QUERY_PREFIX = "query: "

_model = None


def get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer(MODEL_NAME)
    return _model


def encode(text: str) -> list[float]:
    """단일 텍스트를 384차원 벡터로 변환 (저장용 passage)."""
    if not text or not text.strip():
        raise ValueError("text must be non-empty")
    model = get_model()
    prefixed = PASSAGE_PREFIX + text.strip()
    vec = model.encode(prefixed, convert_to_numpy=True, normalize_embeddings=False)
    return vec.tolist()


def encode_query(text: str) -> list[float]:
    """검색용 쿼리 텍스트를 384차원 벡터로 변환 (E5 query prefix)."""
    if not text or not text.strip():
        raise ValueError("query text must be non-empty")
    model = get_model()
    prefixed = QUERY_PREFIX + text.strip()
    vec = model.encode(prefixed, convert_to_numpy=True, normalize_embeddings=False)
    return vec.tolist()
