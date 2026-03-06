'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import styles from './GuestChat.module.css';

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

export default function GuestChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
      at: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
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
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
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
        <div className={styles.panel}>
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
                <span className={styles.msgBubble}>입력 중...</span>
              </div>
            )}
          </div>
          <form className={styles.panelForm} onSubmit={handleSubmit}>
            <input
              type="text"
              className={styles.input}
              placeholder="메시지를 입력하세요"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
              maxLength={500}
            />
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={sending || !input.trim()}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
