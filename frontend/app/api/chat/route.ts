import { NextRequest, NextResponse } from 'next/server';

/**
 * 손님용 채팅 API (더미 · 메모리)
 * POST /api/chat — 메시지 받으면 더미 봇 응답 반환
 */
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = typeof body.message === 'string' ? body.message : '';
    const reply = getDummyReply(message);
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: '잠시 후 다시 시도해 주세요.' }, { status: 500 });
  }
}
