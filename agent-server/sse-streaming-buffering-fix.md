# AI 채팅 SSE 스트리밍 파이프라인

## 전체 흐름

```
브라우저 (ChatPanel.tsx)
  ↕ AsyncGenerator (aiAgent.ts)
    ↕ SSE over HTTP (fetch)
      ↕ Next.js BFF 프록시 (route.ts)
        ↕ Node.js http 모듈
          ↕ Agent Server / FastAPI (chat.py)
            ↕ SSE (sse-starlette)
              ↕ Gemini Python SDK (gemini.py)
                ↕ Gemini 2.5 Flash API
```

모든 레이어에서 **청크를 받는 즉시 다음 레이어로 전달**하며, 중간에 버퍼링하거나 모아두지 않는다.

> **참고:** Gemini 2.5 Flash는 thinking 모델로, 토큰 단위(2~5자)가 아닌
> **~100자 단위 청크**를 ~200ms 간격으로 전송한다.
> 이는 API의 고유 특성이며 우리 코드의 버퍼링이 아니다.

---

## 레이어별 코드

### 1. Gemini API 호출 — `agent-server/app/services/gemini.py`

```python
async_client = genai.Client(
    api_key=GEMINI_API_KEY,
    http_options={'api_version': 'v1alpha'}
)

async def chat_stream(messages: List[dict]) -> AsyncGenerator[str, None]:
    # Gemini 스트리밍 API 호출
    response = await async_client.aio.models.generate_content_stream(
        model=MODEL_NAME,
        contents=messages
    )

    # 받는 즉시 yield — 버퍼링 없음
    async for chunk in response:
        if chunk.text:
            yield chunk.text
```

- `generate_content_stream()`: Gemini의 비동기 스트리밍 API
- `async for chunk in response`: Gemini가 청크를 보낼 때마다 즉시 순회
- `yield chunk.text`: 호출자에게 즉시 전달

### 2. SSE 이벤트 변환 — `agent-server/app/routers/chat.py`

```python
@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    gemini_messages = to_gemini_messages(request.messages)

    async def event_generator():
        # gemini.chat_stream()이 yield할 때마다 SSE 이벤트로 변환
        async for chunk in gemini.chat_stream(gemini_messages):
            if chunk:
                yield {
                    "data": json.dumps({"content": chunk}, ensure_ascii=False)
                }
        yield {"data": "[DONE]"}

    # sse-starlette가 async generator를 SSE 프로토콜로 변환하여 전송
    return EventSourceResponse(event_generator())
```

- `EventSourceResponse`: async generator를 SSE 형식(`data: ...\n\n`)으로 변환
- 각 `yield`마다 즉시 HTTP 청크로 전송

### 3. Next.js BFF 프록시 — `frontend/app/api/agent/chat/route.ts`

```typescript
import http from 'http';

export async function POST(req: NextRequest) {
    const body = await req.json();

    if (body.stream) {
        // Node.js http 모듈로 Agent Server에 요청
        const stream = await requestStreamFromAgent(JSON.stringify(body));
        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no',
            },
        });
    }
    // ...
}

function requestStreamFromAgent(payload: string): Promise<ReadableStream<Uint8Array>> {
    const url = new URL(`${AGENT_BASE}/chat`);

    return new Promise((resolve, reject) => {
        const httpReq = http.request({ /* ... */ }, (res) => {
            const stream = new ReadableStream<Uint8Array>({
                start(controller) {
                    // Agent Server에서 청크가 올 때마다 즉시 enqueue
                    res.on('data', (chunk: Buffer) => {
                        controller.enqueue(new Uint8Array(chunk));
                    });
                    res.on('end', () => controller.close());
                    res.on('error', (err) => controller.error(err));
                },
                cancel() { res.destroy(); },
            });
            resolve(stream);
        });
        httpReq.write(payload);
        httpReq.end();
    });
}
```

**핵심: `fetch` 대신 `http` 모듈을 사용하는 이유**

Next.js의 `fetch` (내부적으로 undici)는 SSE 응답의 `response.body`를
내부적으로 버퍼링한다. `response.body`를 `NextResponse`에 그대로 전달하거나
`ReadableStream`으로 래핑해도 버퍼링이 해소되지 않는다.

Node.js `http` 모듈은 `res.on('data')` 이벤트로 원시 청크를 즉시 받을 수 있어
버퍼링 없이 `ReadableStream`으로 전달 가능하다.

### 4. SSE 파서 — `frontend/app/lib/aiAgent.ts`

```typescript
export async function* sendMessageStream(
    userMessage: string,
    conversationHistory: ChatMessage[] = []
): AsyncGenerator<string, void, unknown> {
    const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, stream: true }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8', { fatal: false });
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // stream: true — 멀티바이트 문자(한글)가 청크 경계에서 잘리는 것 방지
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        // 마지막 요소는 불완전한 라인일 수 있으므로 버퍼에 유지
        buffer = lines.pop() || '';

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
                const data = trimmed.slice(6);
                if (data === '[DONE]') return;

                try {
                    const parsed = JSON.parse(data);
                    if (parsed.content) {
                        yield parsed.content;  // 호출자에게 즉시 전달
                    }
                } catch {
                    // 불완전한 JSON은 무시
                }
            }
        }
    }
}
```

**`lines.pop()` 패턴이 핵심:**

SSE 이벤트가 네트워크 청크 경계에서 잘릴 수 있다:
```
1번째 read(): "data: {\"content\": \"안녕하세"
2번째 read(): "요\"}\n\ndata: {\"content\": \"카페에\"}\n\n"
```

`split('\n')`의 마지막 요소는 `\n`으로 끝나지 않은 불완전한 라인이므로,
`pop()`으로 꺼내 버퍼에 남기고 다음 read()의 데이터와 합쳐서 파싱한다.

### 5. UI 렌더링 — `frontend/app/(public)/_components/AIAgent/ChatPanel.tsx`

```typescript
for await (const chunk of sendMessageStream(messageText, messages)) {
    // 청크가 도착할 때마다 즉시 메시지 content에 추가
    setMessages(prev =>
        prev.map(msg =>
            msg.id === aiMessageId
                ? { ...msg, content: msg.content + chunk }
                : msg
        )
    );
}
```

- `for await`: `sendMessageStream`이 `yield`할 때마다 즉시 실행
- `setMessages`: React 상태 업데이트 → 화면에 즉시 반영

---

## 해결한 문제들

| 레이어 | 문제 | 원인 | 수정 |
|--------|------|------|------|
| Next.js BFF | SSE 응답이 버퍼링되어 한꺼번에 도착 | `fetch`(undici)의 내부 SSE 버퍼링 | `http` 모듈로 교체하여 raw 스트림 사용 |
| SSE 파서 | 청크 경계에서 SSE 라인 잘림 → 데이터 유실 | `split('\n')` 후 불완전한 마지막 라인 처리 안함 | `lines.pop()`으로 불완전한 라인을 버퍼에 유지 |
| SSE 파서 | 한글 등 멀티바이트 문자 깨짐 | `TextDecoder`의 `stream` 옵션 누락 | `decode(value, { stream: true })` 사용 |

---

## 흔히 하는 실수와 수정 방법

### 실수 1: Next.js BFF에서 `fetch`로 SSE를 프록시

```typescript
// ❌ 잘못된 코드 — fetch(undici)가 SSE 응답을 내부 버퍼링함
const response = await fetch(`${AGENT_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
});
return new NextResponse(response.body, {
    headers: { 'Content-Type': 'text/event-stream' },
});
```

**증상:** 스트림이 한꺼번에 도착하거나 TTFB가 수 초 이상 지연됨.

```typescript
// ✅ 올바른 코드 — Node.js http 모듈로 raw 스트림 사용
import http from 'http';

function requestStreamFromAgent(payload: string): Promise<ReadableStream<Uint8Array>> {
    const url = new URL(`${AGENT_BASE}/chat`);
    return new Promise((resolve, reject) => {
        const httpReq = http.request(
            {
                hostname: url.hostname,
                port: url.port,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload),
                },
            },
            (res) => {
                const stream = new ReadableStream<Uint8Array>({
                    start(controller) {
                        res.on('data', (chunk: Buffer) => {
                            controller.enqueue(new Uint8Array(chunk));
                        });
                        res.on('end', () => controller.close());
                        res.on('error', (err) => controller.error(err));
                    },
                    cancel() { res.destroy(); },
                });
                resolve(stream);
            }
        );
        httpReq.on('error', reject);
        httpReq.write(payload);
        httpReq.end();
    });
}
```

**왜?** Next.js의 `fetch`는 내부적으로 undici를 사용하며, SSE `response.body`를
`ReadableStream`으로 래핑해도 undici가 이미 버퍼링한 상태이므로 해소되지 않는다.
Node.js `http` 모듈은 `res.on('data')`로 원시 TCP 청크를 즉시 받을 수 있다.

---

### 실수 2: SSE 파서에서 불완전한 라인 처리 안함

```typescript
// ❌ 잘못된 코드 — 청크 경계에서 잘린 SSE 라인이 유실됨
const decoder = new TextDecoder();

while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
        if (line.startsWith('data: ')) {
            try {
                const parsed = JSON.parse(line.slice(6));
                yield parsed.content;
            } catch (e) {
                // ← 잘린 JSON이 여기서 무시됨 = 데이터 유실
            }
        }
    }
}
```

**증상:** 간헐적으로 텍스트 일부가 누락되거나, 첫 응답이 보이지 않음.

```typescript
// ✅ 올바른 코드 — 불완전한 라인을 버퍼에 유지
const decoder = new TextDecoder('utf-8', { fatal: false });
let buffer = '';

while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';  // ← 핵심: 불완전한 마지막 라인은 버퍼에 유지

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6);
            if (data === '[DONE]') return;
            try {
                const parsed = JSON.parse(data);
                if (parsed.content) yield parsed.content;
            } catch {
                // 불완전한 JSON은 무시
            }
        }
    }
}
```

**왜?** `split('\n')`의 마지막 요소는 아직 `\n`이 도착하지 않은 불완전한 라인이다.
이를 그대로 파싱하면 실패하고, `pop()`으로 버퍼에 남기면 다음 청크와 합쳐져 완전한 라인이 된다.

---

### 실수 3: `TextDecoder`에 `stream: true` 누락

```typescript
// ❌ 잘못된 코드
const decoder = new TextDecoder();
const text = decoder.decode(value);
```

```typescript
// ✅ 올바른 코드
const decoder = new TextDecoder('utf-8', { fatal: false });
const text = decoder.decode(value, { stream: true });
```

**왜?** 한글 등 멀티바이트 UTF-8 문자(3바이트)가 청크 경계에서 잘릴 수 있다.
`{ stream: true }` 없이 디코딩하면 잘린 바이트가 깨진 문자( )로 변환된다.
`{ stream: true }`는 불완전한 바이트를 내부에 보관하고 다음 호출 시 합쳐서 디코딩한다.

---

### 실수 4: Agent Server에서 동기 클라이언트로 스트리밍 호출

```python
# ❌ 잘못된 코드 — 동기 클라이언트는 async for에서 이벤트 루프를 블로킹함
client = genai.Client(api_key=GEMINI_API_KEY)

async def chat_stream(messages):
    response = client.models.generate_content_stream(  # 동기 호출
        model=MODEL_NAME, contents=messages
    )
    for chunk in response:  # 동기 순회 — 이벤트 루프 블로킹
        yield chunk.text
```

```python
# ✅ 올바른 코드 — 비동기 클라이언트 + aio 메서드 사용
async_client = genai.Client(
    api_key=GEMINI_API_KEY,
    http_options={'api_version': 'v1alpha'}
)

async def chat_stream(messages):
    response = await async_client.aio.models.generate_content_stream(
        model=MODEL_NAME, contents=messages
    )
    async for chunk in response:  # 비동기 순회 — 이벤트 루프 블로킹 없음
        if chunk.text:
            yield chunk.text
```

**왜?** FastAPI는 비동기(asyncio) 프레임워크이다. 동기 `generate_content_stream()`과
`for chunk`를 사용하면 Gemini 응답을 기다리는 동안 이벤트 루프가 블로킹되어
다른 요청을 처리할 수 없고, SSE 전송도 지연된다.

---

## 스트리밍 정상 동작 확인 방법

### 1. Agent Server 직접 테스트 (curl)

```bash
curl -s -N -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"아이스 아메리카노 알려줘"}],"stream":true}'
```

**정상:** `data: {"content": "..."}` 이벤트가 실시간으로 하나씩 출력됨.
**비정상:** 응답이 한참 뒤에 한꺼번에 출력됨.

### 2. BFF 경유 테스트 (curl)

```bash
curl -s -N -X POST http://localhost:3011/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"아이스 아메리카노 알려줘"}],"stream":true}'
```

**정상:** Agent Server 직접 테스트와 동일한 속도로 이벤트가 출력됨.
**비정상:** 직접 테스트보다 수 초 이상 늦거나 한꺼번에 출력됨 → BFF 버퍼링 문제.

### 3. TTFB 비교 측정

```bash
# Agent Server 직접
curl -o /dev/null -w "Direct TTFB: %{time_starttransfer}s\n" \
  -s -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"안녕"}],"stream":true}'

# BFF 경유
curl -o /dev/null -w "BFF TTFB: %{time_starttransfer}s\n" \
  -s -X POST http://localhost:3011/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"안녕"}],"stream":true}'
```

**정상:** 두 TTFB가 비슷함 (차이 0.5초 이내).
**비정상:** BFF TTFB가 몇 초 이상 더 큼 → BFF에서 버퍼링 발생.
