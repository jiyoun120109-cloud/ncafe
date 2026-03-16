from pydantic import BaseModel


class Attachment(BaseModel):
    mime_type: str
    data: str


class Message(BaseModel):
    role: str
    content: str
    attachments: list[Attachment] | None = None


class ChatRequest(BaseModel):
    messages: list[Message]
    stream: bool = True
