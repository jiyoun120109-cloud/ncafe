from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import chat, rag


app = FastAPI(title="AI Chat Server")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(chat.router)
app.include_router(rag.router, prefix="/api/rag")


@app.get("/")
def root():
    return {"message": "AI Chat Server", "health": "/health", "chat": "POST /chat"}


@app.get("/health")
def health():
    return {"status": "ok"}
