'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CircleUser, X, Send, GripHorizontal, Smile, ExternalLink, ShoppingCart, Search } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import type { ChatTool } from '@/app/api/chat/route';
import styles from './GuestChat.module.css';

/** public 폴더 기준 챗봇 이미지 경로 */
const CHATBOT_IMAGE = {
  main: '/images/chat/chatbot-main.png',   // FAB·메시지 목록 봇 아바타
  header: '/images/chat/chatbot-header.png', // 패널 상단 헤더
};

const PANEL_MIN_WIDTH = 280;
const PANEL_MAX_WIDTH = 600;
const PANEL_MIN_HEIGHT = 300;
const PANEL_MAX_HEIGHT = 700;
const DEFAULT_WIDTH = 360;
const DEFAULT_HEIGHT = 500;

type Role = 'user' | 'bot';

export interface ChatSearchResult {
  id: number;
  korName?: string;
  engName?: string;
  name?: string;
  price?: number;
}

interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  at: Date;
  tools?: ChatTool[];
  searchResults?: ChatSearchResult[];
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  text: '안녕하세요! 댕댕이에요 🐶 메뉴 추천, 영업시간, 장바구니 담기까지 뭐든 물어보세요!',
  at: new Date(),
};

const EMOJI_LIST = ['😀', '😊', '🥰', '😘', '🙂', '👍', '👋', '❤️', '☕', '🍰', '🥐', '🍪', '🙏', '✨', '💬', '😅', '🐶', '🐕'];

/** 챗봇 장바구니 옵션 선택용 원두 목록 (메뉴 디테일과 동일) */
const BEAN_OPTIONS = [
  { value: '', label: '기본' },
  { value: '에티오피아', label: '에티오피아' },
  { value: '콜롬비아', label: '콜롬비아' },
  { value: '케냐', label: '케냐' },
  { value: '브라질', label: '브라질' },
];

/** 자주 쓰는 문구 – 클릭 시 입력창에 넣음 */
const QUICK_PHRASES = [
  '영업시간',
  '카페위치',
  '추천메뉴',
  '메뉴로이동',
];

/** 사용자 메시지 내용으로 대기 중 귀여운 멘트 결정 */
const LOADING_MESSAGES: { pattern: RegExp; messages: string[] }[] = [
  {
    pattern: /(이동|이동해|가줘|보여줘|열어줘|페이지|메뉴\s*보여|메뉴\s*목록)/,
    messages: ['바로 데려다줄게요~ 🐾', '한 걸음만 기다려요!', '알려주는 중이에요~'],
  },
  {
    pattern: /(담아줘|담기|장바구니)/,
    messages: ['장바구니에 쏙 넣는 중이에요 🛒', '담고 있어요, 잠깐만요!', '맛있는 거 담는 중~'],
  },
  {
    pattern: /(검색|찾아줘)/,
    messages: ['찾아보는 중이에요 🔍', '메뉴 뒤적뒤적 중~', '찾을게요, 기다려 주세요!'],
  },
  {
    pattern: /(추천|뭐\s*먹을|메뉴)/,
    messages: ['맛있는 거 골라볼게요 ☕', '추천 메뉴 생각 중~', '이거 맛있어요! 곧 알려줄게요'],
  },
  {
    pattern: /(영업|시간|언제)/,
    messages: ['영업시간 확인 중이에요 🕐', '바로 알려드릴게요!', '찾아보는 중~'],
  },
  {
    pattern: /(위치|주소|어디)/,
    messages: ['위치 찾아볼게요 🗺️', '곧 알려드릴게요!', '지도 확인 중~'],
  },
];
const DEFAULT_LOADING = [
  '생각 중이에요... 🤔',
  '잠깐만 기다려 주세요~ 🐶',
  '곧 답해드릴게요!',
  '열심히 찾아보는 중이에요 ✨',
  '댕댕이가 알아볼게요!',
];

function getLoadingMessage(userText: string): string {
  const t = (userText || '').trim();
  for (const { pattern, messages } of LOADING_MESSAGES) {
    if (pattern.test(t)) return messages[Math.floor(Math.random() * messages.length)];
  }
  return DEFAULT_LOADING[Math.floor(Math.random() * DEFAULT_LOADING.length)];
}

/** 항상 스트리밍 사용. 스트림 안에 content / tools / action 이 함께 오면 각각 처리함 */
function shouldUseStream(_userText: string): boolean {
  return true;
}

export default function GuestChat() {
  const router = useRouter();
  const { addItem } = useCart();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [panelSize, setPanelSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [addingCartId, setAddingCartId] = useState<number | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('잠깐만요~');
  /** 메시지별 add_to_cart 옵션 선택값. key: `cart-${messageId}-${toolIndex}` */
  const [cartSelections, setCartSelections] = useState<
    Record<string, { temperature: 'HOT' | 'ICED'; decaf: boolean; beanOption: string; quantity: number }>
  >({});
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddToCart = useCallback(
    async (
      menuId: number,
      quantity: number = 1,
      options?: { temperature?: 'HOT' | 'ICED'; decaf?: boolean; beanOption?: string },
      menuDisplayName?: string
    ) => {
      if (addingCartId !== null) return;
      setAddingCartId(menuId);
      try {
        await addItem(menuId, quantity, options);
        const label = (menuDisplayName || '메뉴').trim();
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            role: 'bot',
            text: `${label} 담았어요! 🐶`,
            at: new Date(),
          },
        ]);
      } finally {
        setAddingCartId(null);
      }
    },
    [addItem, addingCartId]
  );

  const getCartSelectionKey = (messageId: string, toolIndex: number) => `cart-${messageId}-${toolIndex}`;
  const defaultCartSelection = (): {
    temperature: 'HOT' | 'ICED';
    decaf: boolean;
    beanOption: string;
    quantity: number;
  } => ({ temperature: 'HOT', decaf: false, beanOption: '', quantity: 1 });

  const handleAddToCartWithSelection = useCallback(
    async (messageId: string, toolIndex: number, menuId: number, menuName: string) => {
      if (addingCartId !== null) return;
      const key = getCartSelectionKey(messageId, toolIndex);
      const sel = cartSelections[key] ?? defaultCartSelection();
      setAddingCartId(menuId);
      try {
        await addItem(menuId, sel.quantity, {
          temperature: sel.temperature,
          decaf: sel.decaf,
          beanOption: sel.beanOption || undefined,
        });
        const tempLabel = sel.temperature === 'ICED' ? '아이스' : 'HOT';
        const beanLabel = sel.beanOption ? ` (${sel.beanOption} 원두)` : '';
        const decafLabel = sel.decaf ? ' 디카페인' : '';
        const summary = `${menuName} ${tempLabel} ${sel.quantity}잔${beanLabel}${decafLabel} 담았어요! 🛒`;
        setMessages((prev) => [
          ...prev,
          { id: `b-${Date.now()}`, role: 'bot', text: summary, at: new Date() },
        ]);
      } finally {
        setAddingCartId(null);
      }
    },
    [addItem, addingCartId, cartSelections]
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobileView(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = panelSize.width;
    const startH = panelSize.height;
    const maxW = Math.min(PANEL_MAX_WIDTH, window.innerWidth - 40);
    const maxH = Math.min(PANEL_MAX_HEIGHT, window.innerHeight - 120);

    const onMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      setPanelSize({
        width: Math.min(maxW, Math.max(PANEL_MIN_WIDTH, startW + dx)),
        height: Math.min(maxH, Math.max(PANEL_MIN_HEIGHT, startH + dy)),
      });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'nwse-resize';
    document.body.style.userSelect = 'none';
  }, [panelSize.width, panelSize.height]);

  const sendMessage = async () => {
    const raw = (input || '').replace(/\r?\n/g, '').trim();
    if (!raw || sending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: raw,
      at: new Date(),
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setSending(true);
    setLoadingMessage(getLoadingMessage(raw));

    const apiMessages = newMessages.map((m) => ({
      role: m.role === 'bot' ? ('model' as const) : ('user' as const),
      content: m.text,
    }));

    const useStream = shouldUseStream(raw);

    try {
      if (useStream) {
        const botId = `b-${Date.now()}`;
        setMessages((prev) => [...prev, { id: botId, role: 'bot', text: '', at: new Date() }]);

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages, stream: true }),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botId ? { ...m, text: errText || '응답을 받지 못했어요. 잠시 후 다시 시도해 주세요.' } : m
            )
          );
          return;
        }

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json().catch(() => ({}));
          const replyText = (data.reply ?? '').trim() || '잠시 후 다시 시도해 주세요.';
          setMessages((prev) =>
            prev.map((m) => (m.id === botId ? { ...m, text: replyText } : m))
          );
          return;
        }

        if (!res.body) {
          setMessages((prev) =>
            prev.map((m) => (m.id === botId ? { ...m, text: '응답을 받지 못했어요.' } : m))
          );
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8', { fatal: false });
        let buffer = '';
        let streamDone = false;

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const data = trimmed.slice(6);
              if (data === '[DONE]') {
                streamDone = true;
                break;
              }
              try {
                const parsed = JSON.parse(data) as {
                  content?: string;
                  error?: string;
                  action?: string;
                  url?: string;
                  tools?: ChatTool[];
                  searchResults?: ChatSearchResult[];
                };
                if (parsed.error) {
                  setMessages((prev) =>
                    prev.map((m) => (m.id === botId ? { ...m, text: parsed.error || '오류가 났어요.' } : m))
                  );
                  streamDone = true;
                  break;
                }
                if (parsed.content) {
                  setMessages((prev) =>
                    prev.map((m) => (m.id === botId ? { ...m, text: m.text + parsed.content } : m))
                  );
                }
                if (parsed.action === 'navigate' && typeof parsed.url === 'string') {
                  const path = parsed.url.startsWith('/') && !parsed.url.startsWith('//') ? parsed.url : `/${parsed.url}`;
                  setOpen(false);
                  router.push(path);
                }
                if (Array.isArray(parsed.tools) && parsed.tools.length > 0) {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === botId
                        ? { ...m, tools: parsed.tools, searchResults: parsed.searchResults }
                        : m
                    )
                  );
                }
              } catch {
                /* 불완전한 JSON 무시 */
              }
            }
          }
        }
        return;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, stream: false } as { messages: typeof apiMessages; stream: false }),
      });
      const data = await res.json().catch(() => ({}));
      const toolsList = (data.tools as ChatTool[] | undefined) ?? [];
      const navTools = toolsList.filter((t) => t.name === 'navigate_to_page' && t.args?.path);
      const hasSingleNav = navTools.length === 1;
      const navLabel = hasSingleNav && navTools[0].args?.label ? String(navTools[0].args.label) : '';
      let replyText = (data.reply ?? '').trim();
      if (!replyText && hasSingleNav) replyText = navLabel ? `${navLabel}로 이동할게요!` : '이동할게요!';
      if (!replyText) replyText = '잠시 후 다시 시도해 주세요.';
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: 'bot',
        text: replyText,
        at: new Date(),
        tools: data.tools,
        searchResults: data.searchResults,
      };
      setMessages((prev) => [...prev, botMsg]);

      let path = hasSingleNav && navTools[0].args.path != null ? String(navTools[0].args.path).trim() : '';
      if (path && !path.startsWith('/')) path = `/${path}`;
      if (path && path.startsWith('/') && !path.startsWith('//')) {
        setOpen(false);
        router.push(path);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          role: 'bot',
          text: '연결에 실패했습니다. 잠시 후 다시 시도해 주세요.',
          at: new Date(),
        },
      ]);
    } finally {
      setSending(false);
      // 전송 후에도 입력창에 포커스 유지 → 엔터 치면 바로 다음 메시지 입력 가능
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleEmojiClick = (emoji: string) => {
    setInput((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const handleQuickPhrase = (phrase: string) => {
    setInput((prev) => (prev ? `${prev} ` : '') + phrase);
    inputRef.current?.focus();
  };

  return (
    <>
      {(!isMobileView || !open) && (
        <button
          type="button"
          className={styles.fab}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? '채팅 닫기' : '댕댕이 챗봇 열기'}
        >
          {open ? <X size={24} className={styles.fabCloseIcon} /> : (
            <Image src={CHATBOT_IMAGE.main} alt="" width={32} height={32} className={styles.fabImg} aria-hidden />
          )}
        </button>
      )}

      {open && (
        <div
          className={`${styles.panel} ${isMobileView ? styles.panelMobile : ''}`}
          style={isMobileView ? undefined : { width: panelSize.width, height: panelSize.height }}
        >
          <div className={styles.panelHeader}>
            <Image src={CHATBOT_IMAGE.header} alt="" width={28} height={28} className={styles.panelTitleIcon} aria-hidden />
            <span className={styles.panelTitle}>댕댕이 도우미</span>
            <span className={styles.panelBadge}>채팅</span>
            {isMobileView && (
              <button
                type="button"
                className={styles.panelCloseBtn}
                onClick={() => setOpen(false)}
                aria-label="채팅 닫기"
              >
                <X size={22} />
              </button>
            )}
          </div>
          <div className={styles.panelList} ref={listRef}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={m.role === 'user' ? styles.msgRowUser : styles.msgRowBot}
              >
                {m.role === 'bot' && (
                  <span className={styles.avatar} title="댕댕이">
                    <Image src={CHATBOT_IMAGE.main} alt="" width={32} height={32} className={styles.avatarImg} />
                  </span>
                )}
                <div className={m.role === 'user' ? styles.msgUser : styles.msgBot}>
                  {m.role === 'bot' && sending && m.text === '' && m.id === messages[messages.length - 1]?.id ? (
                    <div className={styles.msgBubbleLoadingWrap}>
                      <span className={`${styles.msgBubble} ${styles.msgBubbleLoading}`}>{loadingMessage}</span>
                      <span className={styles.typingDots} aria-hidden>
                        <span /><span /><span />
                      </span>
                    </div>
                  ) : (
                    <span className={styles.msgBubble}>
                      {m.text || (m.tools && m.tools.length > 0
                        ? (m.tools.some((t) => t.name === 'navigate_to_page')
                          ? '바로 데려다줄게요! 아래 버튼을 눌러 이동해요 🐾'
                          : '원하는 걸 골라주세요~ 아래에서 눌러 주세요 🐶')
                        : '')}
                    </span>
                  )}
                {m.role === 'bot' && m.tools && m.tools.length > 0 && (
                  <div className={styles.toolActions}>
                    {m.tools.map((tool, i) => {
                      if (tool.name === 'navigate_to_page') {
                        const rawPath = (tool.args.path as string) || '/';
                        const path = rawPath.startsWith('/') && !rawPath.startsWith('//') ? rawPath : '/';
                        const label = (tool.args.label as string) || '이동';
                        return (
                          <Link
                            key={`nav-${i}`}
                            href={path}
                            className={styles.toolLink}
                          >
                            <ExternalLink size={12} />
                            {label}
                          </Link>
                        );
                      }
                      if (tool.name === 'add_to_cart' && typeof tool.args.menuId === 'number') {
                        const menuId = tool.args.menuId as number;
                        const menuName = (tool.args.menuName as string) || '메뉴';
                        const cartKey = getCartSelectionKey(m.id, i);
                        const sel = cartSelections[cartKey] ?? defaultCartSelection();
                        const setSel = (patch: Partial<typeof sel>) =>
                          setCartSelections((prev) => ({ ...prev, [cartKey]: { ...(prev[cartKey] ?? defaultCartSelection()), ...patch } }));
                        const isAdding = addingCartId === menuId;
                        return (
                          <div key={`cart-${i}`} className={styles.cartOptionBlock}>
                            <p className={styles.cartOptionHint}>
                              아래에서 온도·디카페인·원두·수량을 선택한 뒤 담기 버튼을 눌러 주세요.
                            </p>
                            <div className={styles.cartOptionRow}>
                              <span className={styles.cartOptionLabel}>온도</span>
                              <div className={styles.cartOptionBtns}>
                                {(['HOT', 'ICED'] as const).map((t) => (
                                  <button
                                    key={t}
                                    type="button"
                                    className={`${styles.cartOptionBtn} ${sel.temperature === t ? styles.cartOptionBtnActive : ''}`}
                                    onClick={() => setSel({ temperature: t })}
                                  >
                                    {t === 'ICED' ? '아이스' : 'HOT'}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className={styles.cartOptionRow}>
                              <span className={styles.cartOptionLabel}>디카페인</span>
                              <div className={styles.cartOptionBtns}>
                                <button
                                  type="button"
                                  className={`${styles.cartOptionBtn} ${!sel.decaf ? styles.cartOptionBtnActive : ''}`}
                                  onClick={() => setSel({ decaf: false })}
                                >
                                  일반
                                </button>
                                <button
                                  type="button"
                                  className={`${styles.cartOptionBtn} ${sel.decaf ? styles.cartOptionBtnActive : ''}`}
                                  onClick={() => setSel({ decaf: true })}
                                >
                                  디카페인
                                </button>
                              </div>
                            </div>
                            <div className={styles.cartOptionRow}>
                              <span className={styles.cartOptionLabel}>원두</span>
                              <div className={styles.cartOptionBtns}>
                                {BEAN_OPTIONS.map((b) => (
                                  <button
                                    key={b.value || 'default'}
                                    type="button"
                                    className={`${styles.cartOptionBtn} ${sel.beanOption === b.value ? styles.cartOptionBtnActive : ''}`}
                                    onClick={() => setSel({ beanOption: b.value })}
                                  >
                                    {b.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className={styles.cartOptionRow}>
                              <span className={styles.cartOptionLabel}>수량</span>
                              <div className={styles.cartQuantityWrap}>
                                <button
                                  type="button"
                                  className={styles.cartQuantityBtn}
                                  onClick={() => setSel({ quantity: Math.max(1, sel.quantity - 1) })}
                                  aria-label="수량 줄이기"
                                >
                                  −
                                </button>
                                <span className={styles.cartQuantityNum}>{sel.quantity}</span>
                                <button
                                  type="button"
                                  className={styles.cartQuantityBtn}
                                  onClick={() => setSel({ quantity: Math.min(99, sel.quantity + 1) })}
                                  aria-label="수량 늘리기"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <button
                              type="button"
                              className={styles.cartSubmitBtn}
                              onClick={() => handleAddToCartWithSelection(m.id, i, menuId, menuName)}
                              disabled={isAdding}
                            >
                              <ShoppingCart size={14} />
                              {isAdding ? '담는 중…' : '장바구니에 담기'}
                            </button>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
                {m.role === 'bot' && m.searchResults && m.searchResults.length > 0 && (
                  <div className={styles.searchResults}>
                    {m.searchResults.map((item) => (
                      <Link
                        key={item.id}
                        href={`/menus/${item.id}`}
                        className={styles.searchResultItem}
                      >
                        <Search size={12} />
                        <span className={styles.searchResultName}>
                          {item.korName ?? item.engName ?? item.name ?? `메뉴 #${item.id}`}
                        </span>
                        {item.price != null && (
                          <span className={styles.searchResultPrice}>
                            {item.price.toLocaleString()}원
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
                </div>
                {m.role === 'user' && (
                  <span className={styles.avatarUser} title="나">
                    <CircleUser size={20} aria-hidden />
                  </span>
                )}
              </div>
            ))}
            {sending &&
              (messages.length === 0 ||
                messages[messages.length - 1].role !== 'bot' ||
                messages[messages.length - 1].text !== '') && (
              <div className={styles.msgRowBot}>
                <span className={styles.avatar} title="댕댕이">
                  <Image src={CHATBOT_IMAGE.main} alt="" width={32} height={32} className={styles.avatarImg} />
                </span>
                <div className={styles.msgBot}>
                  <div className={styles.msgBubbleLoadingWrap}>
                    <span className={`${styles.msgBubble} ${styles.msgBubbleLoading}`}>{loadingMessage}</span>
                    <span className={styles.typingDots} aria-hidden>
                      <span /><span /><span />
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className={styles.quickPhrases}>
            {QUICK_PHRASES.map((phrase) => (
              <button
                key={phrase}
                type="button"
                className={styles.quickChip}
                onClick={() => handleQuickPhrase(phrase)}
                disabled={sending}
              >
                {phrase}
              </button>
            ))}
          </div>
          <form className={styles.panelForm} onSubmit={handleSubmit}>
            {showEmojiPicker && (
              <div className={styles.emojiPicker} role="listbox" aria-label="이모티콘 선택">
                {EMOJI_LIST.map((emoji, i) => (
                  <button
                    key={`${emoji}-${i}`}
                    type="button"
                    className={styles.emojiItem}
                    onClick={() => handleEmojiClick(emoji)}
                    aria-label={`이모티콘 ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            <div className={styles.formRow}>
              <div className={styles.inputRow}>
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={() => setShowEmojiPicker((v) => !v)}
                  disabled={sending}
                  aria-label="이모티콘"
                  title="이모티콘"
                  aria-expanded={showEmojiPicker}
                >
                  <Smile size={20} />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  className={styles.input}
                  placeholder="댕댕이에게 말해줘..."
                  value={input}
                  onChange={(e) => setInput((e.target.value || '').replace(/\r?\n/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (!e.nativeEvent.isComposing) handleSubmit(e as unknown as React.FormEvent);
                    }
                  }}
                  disabled={sending}
                  maxLength={500}
                />
              </div>
              <button
                type="submit"
                className={styles.sendBtn}
                disabled={sending || !input.trim()}
              >
                <Send size={18} />
              </button>
            </div>
          </form>
          {!isMobileView && (
            <div
              className={styles.resizeHandle}
              onMouseDown={handleResizeStart}
              aria-label="창 크기 조절"
            >
              <GripHorizontal size={16} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
