import { NextRequest, NextResponse } from 'next/server';
import http from 'http';
import https from 'https';

const AGENT_SERVER_URL = process.env.AGENT_SERVER_URL || '';
const BACKEND_BASE = process.env.API_BASE_URL || process.env.BACKEND_URL || 'http://localhost:8011';

/** Agent 서버로 SSE 스트림 요청 (fetch 대신 http 모듈 사용 → 버퍼링 없이 청크 즉시 전달) */
function requestStreamFromAgent(payload: string): Promise<ReadableStream<Uint8Array>> {
  const url = new URL(AGENT_SERVER_URL.replace(/\/$/, '') + '/chat');
  const isHttps = url.protocol === 'https:';
  const mod = isHttps ? https : http;
  const body = Buffer.from(payload, 'utf-8');
  return new Promise((resolve, reject) => {
    const req = mod.request(
      {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': body.length,
        },
      },
      (res) => {
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            res.on('data', (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
            res.on('end', () => controller.close());
            res.on('error', (err) => controller.error(err));
          },
          cancel() {
            res.destroy();
          },
        });
        resolve(stream);
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/** 챗봇에서 사용하는 도구 타입 */
export type ChatToolName = 'navigate_to_page' | 'add_to_cart' | 'search_menu';

export interface ChatTool {
  name: ChatToolName;
  args: Record<string, unknown>;
}

export interface MenuItemForChat {
  id: number;
  korName?: string;
  name?: string;
  price?: number;
}

const DUMMY_REPLIES: { pattern: RegExp | string; reply: string }[] = [
  { pattern: /안녕|hello|hi/i, reply: '안녕하세요! NCafe입니다. 무엇을 도와드릴까요?' },
  { pattern: /메뉴|추천|뭐 먹을까/i, reply: '오늘은 시그니처 커피나 카페라떼를 추천드려요. 메뉴 페이지에서 자세히 보실 수 있어요.' },
  { pattern: /가격|얼마|비용/i, reply: '메뉴별 가격은 메뉴 페이지에서 확인하실 수 있습니다. 대표 메뉴는 4,000원~7,500원대예요.' },
  { pattern: /영업|시간|오픈|휴무/i, reply: '영업 시간은 매일 09:00~21:00입니다. 자세한 내용은 매장에 문의해 주세요.' },
  { pattern: /주문|배달|테이크아웃/i, reply: '현재 매장 내 이용과 테이크아웃을 운영 중입니다. 카운터에서 주문해 주세요.' },
  { pattern: /감사|고맙|thank/i, reply: '감사합니다. NCafe를 이용해 주셔서 감사해요. 좋은 하루 되세요!' },
  { pattern: /바이|종료|끝/i, reply: '대화해 주셔서 감사합니다. 또 찾아 주세요!' },
];

function getDummyReply(userMessage: string): string {
  const trimmed = (userMessage || '').trim();
  if (!trimmed) return '메시지를 입력해 주세요.';

  for (const { pattern, reply } of DUMMY_REPLIES) {
    if (typeof pattern === 'string' && trimmed.includes(pattern)) return reply;
    if (pattern instanceof RegExp && pattern.test(trimmed)) return reply;
  }

  const fallbacks = [
    '말씀해 주신 내용은 담당자가 확인 후 답변 드릴 수 있습니다. 메뉴 문의는 매장으로 연락 주세요.',
    'NCafe는 커피와 브런치를 제공하는 카페입니다. 메뉴나 이용 안내가 필요하시면 말씀해 주세요.',
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

/** 백엔드에서 메뉴 목록 조회 (서버에서 호출) */
async function fetchMenusFromBackend(searchQuery?: string): Promise<MenuItemForChat[]> {
  const base = BACKEND_BASE.replace(/\/$/, '');
  const params = new URLSearchParams();
  if (searchQuery && searchQuery.trim()) params.set('searchQuery', searchQuery.trim());
  const url = `${base}/api/menus${params.toString() ? `?${params}` : ''}`;
  try {
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({}));
    const list = data.menus ?? data ?? [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** 사용자 메시지에서 도구 의도 감지 및 실행 가능한 도구 반환 */
function detectTools(userMessage: string): ChatTool[] {
  const t = (userMessage || '').trim().toLowerCase();
  const tools: ChatTool[] = [];

  // 1) 메뉴 페이지로 이동
  if (
    /\b(메뉴|메뉴판)\s*(페이지?로?\s*)?(이동|가줘|보여줘|열어줘|가자)/i.test(t) ||
    /(메뉴|메뉴판)(\s+\S+)?\s*보여/i.test(t) ||
    /메뉴\s*보여/i.test(t) ||
    /메뉴\s*목록\s*보여/i.test(t) ||
    /메뉴\s*페이지/i.test(t) ||
    /^(메뉴|메뉴판|메뉴로이동|메뉴로\s*이동)\s*$/i.test(t) ||
    /\b(메뉴|메뉴판)\s*(보자|볼래|볼까)/i.test(t) ||
    /메뉴\s*보자/i.test(t) ||
    /메뉴\s*볼래/i.test(t) ||
    /메뉴\s*열어/i.test(t)
  ) {
    tools.push({ name: 'navigate_to_page', args: { path: '/menus', label: '메뉴' } });
  }

  // 2) 장바구니 페이지 (담아줘만 써도 장바구니로 이해)
  if (
    /\b장바구니\s*(페이지?로?\s*)?(이동|가줘|보여줘|열어줘)/i.test(t) ||
    /장바구니\s*보여/i.test(t) ||
    /^(담아줘|담아\s*줘|담기|장바구니|카트)\s*$/i.test(t) ||
    /\b(장바구니|카트)\s*(가자|가줘|보자|열어)/i.test(t) ||
    /담기\s*(페이지)?\s*(가자|가줘|보여)/i.test(t)
  ) {
    tools.push({ name: 'navigate_to_page', args: { path: '/cart', label: '장바구니' } });
  }

  // 3) 주문 페이지 (주문해줘, 주문할게 등)
  if (
    /\b주문\s*(페이지?로?\s*)?(이동|가줘|보여줘|해줘)/i.test(t) ||
    /^(주문해줘|주문해\s*줘|주문할게|주문할래|주문하기)\s*$/i.test(t) ||
    /주문\s*(페이지)?\s*가자/i.test(t) ||
    /주문\s*하러\s*가/i.test(t)
  ) {
    tools.push({ name: 'navigate_to_page', args: { path: '/order', label: '주문' } });
  }

  // 4) 결제 페이지
  if (
    /\b결제\s*(페이지?로?\s*)?(이동|가줘|보여줘)/i.test(t) ||
    /^(결제해줘|결제할게|결제하기)\s*$/i.test(t) ||
    /결제\s*하러\s*가/i.test(t)
  ) {
    tools.push({ name: 'navigate_to_page', args: { path: '/payment', label: '결제' } });
  }

  // 5) 영업시간
  if (
    /^(영업시간|영업\s*시간)\s*$/i.test(t) ||
    /\b영업\s*시간\s*(알려|몇\s*시|언제)/i.test(t) ||
    /몇\s*시\s*(에\s*)?(열어|닫아|오픈|영업)/i.test(t) ||
    /(오픈|닫는)\s*시간/i.test(t) ||
    /영업\s*해줘/i.test(t)
  ) {
    tools.push({ name: 'navigate_to_page', args: { path: '/', label: '영업시간' } });
  }

  // 6) 카페 위치/주소
  if (
    /^(카페위치|카페\s*위치|위치|주소)\s*$/i.test(t) ||
    /\b(위치|주소|어디에|찾아가기|오는\s*길)\s*(알려|가줘|보여)/i.test(t) ||
    /카페\s*어디/i.test(t) ||
    /(지도|오시는\s*길)/i.test(t)
  ) {
    tools.push({ name: 'navigate_to_page', args: { path: '/location', label: '매장 위치' } });
  }

  // 7) 추천 메뉴
  if (
    /^(추천메뉴|추천\s*메뉴|추천)\s*$/i.test(t) ||
    /\b(추천|인기)\s*(메뉴)?\s*(보여|알려|뭐야)/i.test(t) ||
    /뭐가\s*맛있어/i.test(t) ||
    /인기\s*메뉴/i.test(t)
  ) {
    tools.push({ name: 'navigate_to_page', args: { path: '/menus', label: '추천 메뉴' } });
  }

  // 8) 공지사항
  if (
    /\b(공지|공지사항)\s*(페이지?로?\s*)?(이동|가줘|보여줘|열어)/i.test(t) ||
    /공지사항\s*보여/i.test(t) ||
    /^(공지|공지사항)\s*$/i.test(t)
  ) {
    tools.push({ name: 'navigate_to_page', args: { path: '/notices', label: '공지사항' } });
  }

  // 9) 1:1 문의
  if (
    /\b(1:1\s*문의|문의하기|문의\s*페이지)\s*(이동|가줘|보여줘|열어)/i.test(t) ||
    /1:1\s*문의/i.test(t) ||
    /문의\s*해줘/i.test(t)
  ) {
    tools.push({ name: 'navigate_to_page', args: { path: '/inquiries', label: '1:1 문의' } });
  }

  // 10) 마이페이지
  if (
    /\b(마이페이지|내\s*정보)\s*(페이지?로?\s*)?(이동|가줘|보여줘|열어)/i.test(t) ||
    /마이페이지\s*보여/i.test(t) ||
    /^(마이페이지|내정보)\s*$/i.test(t)
  ) {
    tools.push({ name: 'navigate_to_page', args: { path: '/user', label: '마이페이지' } });
  }

  // 11) 즐겨찾기
  if (
    /\b즐겨찾기\s*(페이지?로?\s*)?(이동|가줘|보여줘|열어)/i.test(t) ||
    /^(즐겨찾기|찜)\s*$/i.test(t)
  ) {
    tools.push({ name: 'navigate_to_page', args: { path: '/user?tab=favorites', label: '즐겨찾기' } });
  }

  // 12) 로그인
  if (
    /\b로그인\s*(페이지?로?\s*)?(이동|가줘|보여줘|가자)/i.test(t) ||
    /로그인\s*해줘/i.test(t) ||
    /^(로그인)\s*$/i.test(t)
  ) {
    tools.push({ name: 'navigate_to_page', args: { path: '/login', label: '로그인' } });
  }

  // 13) 회원가입
  if (
    /\b(회원가입|가입)\s*(페이지?로?\s*)?(이동|가줘|보여줘|가자)/i.test(t) ||
    /^(회원가입|가입)\s*$/i.test(t)
  ) {
    tools.push({ name: 'navigate_to_page', args: { path: '/signup', label: '회원가입' } });
  }

  // 14) 홈/메인
  if (
    /\b(홈|메인)\s*(으로?\s*)?(이동|가줘|가자)/i.test(t) ||
    /처음\s*(으로|화면)/i.test(t) ||
    /^(홈|메인)\s*$/i.test(t)
  ) {
    tools.push({ name: 'navigate_to_page', args: { path: '/', label: '홈' } });
  }

  // 15) 장바구니에 OO 담아줘 (메뉴명 추출) – "OO 담아줘", "OO 담기" 등
  const addMatch = t.match(/(?:장바구니에?|담아\s*줘|담기)\s*[:\s]*([가-힣a-zA-Z0-9\s]+?)(?:\s*[1-9]\s*개?)?\s*[\.!]?$/);
  if (addMatch) {
    const menuName = addMatch[1].trim().replace(/\s+/g, ' ');
    if (menuName.length >= 1) {
      tools.push({ name: 'add_to_cart', args: { menuName } });
    }
  }
  const addShort = t.match(/^(.+?)\s*(?:담아\s*줘|담아줘|담기|장바구니에\s*담)/);
  if (addShort && !tools.some((x) => x.name === 'add_to_cart')) {
    const menuName = addShort[1].trim().replace(/\s+/g, ' ');
    if (menuName.length >= 1) {
      tools.push({ name: 'add_to_cart', args: { menuName } });
    }
  }

  // 16) 메뉴 검색
  const searchMatch = t.match(/(.+?)\s*(?:검색|찾아줘|보여줘|있어)/);
  if (searchMatch) {
    const query = searchMatch[1].trim().replace(/\s+/g, ' ');
    if (query.length >= 1) {
      tools.push({ name: 'search_menu', args: { query } });
    }
  }
  if (/\b메뉴\s*검색\b/i.test(t)) {
    const rest = t.replace(/메뉴\s*검색\s*/i, '').trim();
    tools.push({ name: 'search_menu', args: { query: rest || '' } });
  }

  return tools;
}

/** 도구 실행 (서버에서 할 수 있는 것만: search_menu 결과 채우기, add_to_cart용 menuId 조회) */
async function runTools(
  tools: ChatTool[],
  lastUserMessage: string
): Promise<{ reply: string; tools: ChatTool[]; searchResults?: MenuItemForChat[] }> {
  let reply = '';
  const resolvedTools: ChatTool[] = [];
  let searchResults: MenuItemForChat[] | undefined;

  for (const tool of tools) {
    if (tool.name === 'navigate_to_page') {
      resolvedTools.push(tool);
      const label = (tool.args.label as string) || '페이지';
      if (!reply) reply = `${label}로 이동할게요!`;
    } else if (tool.name === 'add_to_cart') {
      const menuName = (tool.args.menuName as string) || '';
      const menus = await fetchMenusFromBackend(menuName);
      const match = menus.find(
        (m) =>
          (m.korName && m.korName.includes(menuName)) ||
          (m.name && m.name.toLowerCase().includes(menuName.toLowerCase())) ||
          (menuName.length >= 2 && (m.korName || m.name || '').toLowerCase().includes(menuName.toLowerCase()))
      );
      if (match) {
        resolvedTools.push({ name: 'add_to_cart', args: { menuId: match.id, menuName: match.korName || match.name } });
        reply = reply || `${match.korName || match.name} 담기를 도와드릴게요. 아래 버튼을 눌러 담으세요.`;
      } else {
        reply = reply || `"${menuName}"에 해당하는 메뉴를 찾지 못했어요. 메뉴 이름을 정확히 적어주시거나, 메뉴 페이지에서 담아 주세요.`;
      }
    } else if (tool.name === 'search_menu') {
      const query = (tool.args.query as string) || lastUserMessage.trim();
      const menus = await fetchMenusFromBackend(query);
      searchResults = menus.slice(0, 10);
      resolvedTools.push({ name: 'search_menu', args: { query, count: searchResults.length } });
      if (searchResults.length > 0) {
        reply =
          reply ||
          `"${query}" 검색 결과 ${searchResults.length}건이에요. 아래에서 선택해 보세요.`;
      } else {
        reply = reply || `"${query}"에 맞는 메뉴가 없어요. 다른 키워드로 검색해 보세요.`;
      }
    }
  }

  return { reply, tools: resolvedTools, searchResults };
}

/**
 * BFF: 클라이언트 요청을 agent-server(Gemini)로 프록시.
 * AGENT_SERVER_URL이 있으면 POST /chat 호출, 없으면 더미 응답.
 * 응답에 도구(navigate, add_to_cart, search_menu) 의도가 있으면 감지해 함께 반환.
 */
type ChatAttachment = { mimeType?: string; data: string };
type ChatMessageForAgent = { role: 'user' | 'model'; content: string; attachments?: ChatAttachment[] };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = typeof body.message === 'string' ? body.message : '';
    type Msg = { role?: string; content?: string; attachments?: ChatAttachment[] };
    const rawMessages = Array.isArray(body.messages) && body.messages.length > 0
      ? (body.messages as Msg[])
      : message.trim()
        ? [{ role: 'user' as const, content: message }]
        : [];

    const messages: ChatMessageForAgent[] = rawMessages
      .map((m) => ({
        role: (m.role === 'model' ? 'model' : 'user') as 'user' | 'model',
        content: typeof m.content === 'string' ? m.content : '',
        attachments: Array.isArray(m.attachments) ? m.attachments : undefined,
      }))
      .filter((m) => m.content !== '' || (m.attachments && m.attachments.length > 0));

    const lastUserContent =
      messages.length > 0 && messages[messages.length - 1].role === 'user'
        ? messages[messages.length - 1].content
        : message || '';

    const toAgentMessages = (msgs: ChatMessageForAgent[]) =>
      msgs.map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.attachments?.length
          ? {
              attachments: m.attachments.map((a) => ({
                mime_type: a.mimeType || 'image/jpeg',
                data: a.data,
              })),
            }
          : {}),
      }));

    // 스트리밍: Agent에 http 모듈로 요청해 SSE 스트림 그대로 전달 (undici 버퍼링 방지)
    if (body.stream && AGENT_SERVER_URL && messages.length > 0) {
      const payload = JSON.stringify({ messages: toAgentMessages(messages), stream: true });
      const stream = await requestStreamFromAgent(payload);
      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    }

    let reply: string;
    let tools: ChatTool[] = [];
    let searchResults: MenuItemForChat[] | undefined;

    // Agent-server가 있으면 Gemini + 도구 호출 사용; 없으면 패턴 기반 더미/도구
    if (AGENT_SERVER_URL && messages.length > 0) {
      const base = AGENT_SERVER_URL.replace(/\/$/, '');
      const res = await fetch(`${base}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: toAgentMessages(messages), stream: false }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        reply = (data.content ?? '').trim();
        if (Array.isArray(data.tools) && data.tools.length > 0) {
          tools = data.tools;
        }
        if (Array.isArray(data.searchResults) && data.searchResults.length > 0) {
          searchResults = data.searchResults;
        }
        // Agent가 도구를 안 돌려줘도, 사용자 말에 이동 의도가 있으면 BFF에서 보정해 프론트에 전달 (페이지 이동 가능하도록)
        if (tools.length === 0) {
          const detected = detectTools(lastUserContent);
          const navOnly = detected.filter((t) => t.name === 'navigate_to_page');
          if (navOnly.length > 0) {
            tools = navOnly;
            if (!reply) {
              const label = (navOnly[0].args?.label as string) || '페이지';
              reply = `${label}로 이동할게요!`;
            }
          }
        }
        // 이동 요청이면 되묻지 않고 바로 이동하도록 응답 문구 통일 (Agent가 "이동할까요?" 등으로 말해도 덮어씀)
        const navTools = Array.isArray(tools) ? tools.filter((t) => t.name === 'navigate_to_page') : [];
        if (navTools.length === 1 && navTools[0].args?.path) {
          const label = (navTools[0].args.label as string) || '페이지';
          reply = `${label}로 이동할게요!`;
        }
      } else if (res.status === 503) {
        const err = await res.json().catch(() => ({}));
        reply = err.detail ?? '챗봇 설정이 완료되지 않았습니다. 관리자에게 문의하세요.';
      } else {
        reply = getDummyReply(lastUserContent);
      }
    } else {
      const detectedTools = detectTools(lastUserContent);
      if (detectedTools.length > 0) {
        const run = await runTools(detectedTools, lastUserContent);
        reply = run.reply;
        tools = run.tools;
        searchResults = run.searchResults;
      } else {
        reply = getDummyReply(lastUserContent);
      }
    }

    const payload: {
      reply: string;
      tools?: ChatTool[];
      searchResults?: MenuItemForChat[];
    } = { reply: reply || '잠시 후 다시 시도해 주세요.' };
    if (tools.length > 0) payload.tools = tools;
    if (searchResults && searchResults.length > 0) payload.searchResults = searchResults;

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ reply: '잠시 후 다시 시도해 주세요.' }, { status: 500 });
  }
}
