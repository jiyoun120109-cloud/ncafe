'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, GripHorizontal, Paperclip, Smile } from 'lucide-react';
import styles from './GuestChat.module.css';

const PANEL_MIN_WIDTH = 280;
const PANEL_MAX_WIDTH = 600;
const PANEL_MIN_HEIGHT = 300;
const PANEL_MAX_HEIGHT = 700;
const DEFAULT_WIDTH = 360;
const DEFAULT_HEIGHT = 420;

type Role = 'user' | 'bot';
interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  at: Date;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  text: '안녕하세요! NCafe입니다. 메뉴 추천, 영업 시간 등 궁금한 점을 물어보세요.',
  at: new Date(),
};

const EMOJI_LIST = ['😀', '😊', '🥰', '😘', '🙂', '👍', '👋', '❤️', '☕', '🍰', '🥐', '🍪', '🙏', '✨', '💬', '😅'];

export default function GuestChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [panelSize, setPanelSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
      at: new Date(),
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setSending(true);

    // Gemini에 대화 맥락 전달: 전체 히스토리 (user/model) + 새 메시지
    const apiMessages = newMessages.map((m) => ({
      role: m.role === 'bot' ? ('model' as const) : ('user' as const),
      content: m.text,
    }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, stream: false }),
      });
      const data = await res.json().catch(() => ({}));
      const replyText = data.reply ?? '잠시 후 다시 시도해 주세요.';
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: 'bot',
        text: replyText,
        at: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
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

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 현재 챗봇 API는 텍스트만 지원. 첨부 파일은 UI만 제공 (추후 확장 가능)
      setInput((prev) => (prev ? `${prev} ` : '') + `[첨부: ${file.name}]`);
    }
    e.target.value = '';
  };

  return (
    <>
      <button
        type="button"
        className={styles.fab}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? '채팅 닫기' : '채팅 열기'}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {open && (
        <div
          className={styles.panel}
          style={{ width: panelSize.width, height: panelSize.height }}
        >
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>NCafe 문의</span>
            <span className={styles.panelBadge}>채팅</span>
          </div>
          <div className={styles.panelList} ref={listRef}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={m.role === 'user' ? styles.msgUser : styles.msgBot}
              >
                <span className={styles.msgBubble}>{m.text}</span>
              </div>
            ))}
            {sending && (
              <div className={styles.msgBot}>
                <span className={`${styles.msgBubble} ${styles.msgBubbleLoading}`}>
                  잠깐만요~
                </span>
              </div>
            )}
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
                  onClick={handleAttachClick}
                  disabled={sending}
                  aria-label="첨부하기"
                  title="첨부하기"
                >
                  <Paperclip size={20} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className={styles.fileInput}
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  aria-hidden
                />
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
                  placeholder="메시지를 입력해주세요."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
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
          <div
            className={styles.resizeHandle}
            onMouseDown={handleResizeStart}
            aria-label="창 크기 조절"
          >
            <GripHorizontal size={16} />
          </div>
        </div>
      )}
    </>
  );
}
