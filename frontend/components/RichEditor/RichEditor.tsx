'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link2, ImagePlus, Paperclip } from 'lucide-react';
import { uploadNoticeFile } from '@/services/adminNoticeService';
import styles from './RichEditor.module.css';

export interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  disabled?: boolean;
  className?: string;
}

export default function RichEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요',
  minHeight = 280,
  disabled = false,
  className = '',
}: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== lastValueRef.current) {
      lastValueRef.current = value;
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const getSelection = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return window.getSelection();
  }, []);

  const exec = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value ?? undefined);
    const html = editorRef.current?.innerHTML ?? '';
    lastValueRef.current = html;
    onChange(html);
  }, [onChange]);

  const execList = useCallback((command: 'insertUnorderedList' | 'insertOrderedList') => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (!el.contains(range.commonAncestorContainer)) {
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    document.execCommand(command, false);
    const html = el.innerHTML ?? '';
    lastValueRef.current = html;
    onChange(html);
  }, [onChange]);

  const insertHtml = useCallback((html: string) => {
    const sel = getSelection();
    if (!sel || !editorRef.current) return;
    const range = sel.getRangeAt(0);
    const fragment = range.createContextualFragment(html);
    range.deleteContents();
    range.insertNode(fragment);
    const newHtml = editorRef.current.innerHTML;
    lastValueRef.current = newHtml;
    onChange(newHtml);
  }, [getSelection, onChange]);

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const { url } = await uploadNoticeFile(file);
        const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url.startsWith('/') ? url : '/' + url}` : url;
        insertHtml(`<img src="${fullUrl}" alt="" style="max-width:100%;height:auto;" />`);
      } catch (e) {
        console.error(e);
        alert(e instanceof Error ? e.message : '이미지 업로드에 실패했습니다.');
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }, [insertHtml]);

  const attachmentHandler = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const { url } = await uploadNoticeFile(file);
        const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url.startsWith('/') ? url : '/' + url}` : url;
        insertHtml(` <a href="${fullUrl}" target="_blank" rel="noopener noreferrer">[첨부: ${file.name}]</a> `);
      } catch (e) {
        console.error(e);
        alert(e instanceof Error ? e.message : '첨부파일 업로드에 실패했습니다.');
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }, [insertHtml]);

  const handleInput = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? '';
    lastValueRef.current = html;
    onChange(html);
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const file = Array.from(items).find((item) => item.type.startsWith('image/'))?.getAsFile();
    if (!file) return;
    e.preventDefault();
    uploadNoticeFile(file).then(({ url }) => {
      const fullUrl = `${window.location.origin}${url.startsWith('/') ? url : '/' + url}`;
      insertHtml(`<img src="${fullUrl}" alt="" style="max-width:100%;height:auto;" />`);
    }).catch(() => {});
  }, [insertHtml]);

  return (
    <div className={`${styles.wrapper} ${className}`} style={{ minHeight: minHeight + 80 }}>
      {uploading && (
        <div className={styles.uploadOverlay}>
          <span>업로드 중...</span>
        </div>
      )}
      <div className={styles.toolbar}>
        <button type="button" tabIndex={-1} onMouseDown={(e) => { e.preventDefault(); exec('bold'); }} className={styles.tbBtn} title="굵게">B</button>
        <button type="button" tabIndex={-1} onMouseDown={(e) => { e.preventDefault(); exec('italic'); }} className={styles.tbBtn} title="기울임">I</button>
        <button type="button" tabIndex={-1} onMouseDown={(e) => { e.preventDefault(); exec('underline'); }} className={styles.tbBtn} title="밑줄">U</button>
        <button type="button" tabIndex={-1} onMouseDown={(e) => { e.preventDefault(); exec('strikeThrough'); }} className={styles.tbBtn} title="취소선">S</button>
        <span className={styles.tbSep} />
        <button type="button" tabIndex={-1} onMouseDown={(e) => { e.preventDefault(); execList('insertUnorderedList'); }} className={styles.tbBtn} title="글머리 목록">•</button>
        <button type="button" tabIndex={-1} onMouseDown={(e) => { e.preventDefault(); execList('insertOrderedList'); }} className={styles.tbBtn} title="번호 목록">1.</button>
        <span className={styles.tbSep} />
        <button type="button" tabIndex={-1} onMouseDown={(e) => { e.preventDefault(); const url = prompt('링크 URL:'); if (url) exec('createLink', url); }} className={styles.tbBtnIcon} title="링크"><Link2 size={20} strokeWidth={2} /></button>
        <button type="button" tabIndex={-1} onMouseDown={(e) => { e.preventDefault(); imageHandler(); }} className={styles.tbBtnIcon} disabled={disabled || uploading} title="이미지"><ImagePlus size={20} strokeWidth={2} /></button>
        <button type="button" tabIndex={-1} onMouseDown={(e) => { e.preventDefault(); attachmentHandler(); }} className={styles.tbBtnIcon} disabled={disabled || uploading} title="첨부파일"><Paperclip size={20} strokeWidth={2} /></button>
      </div>
      <div
        ref={editorRef}
        className={styles.editor}
        contentEditable={!disabled}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        style={{ minHeight }}
        onInput={handleInput}
        onPaste={handlePaste}
      />
    </div>
  );
}
