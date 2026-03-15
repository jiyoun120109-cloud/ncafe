'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  getInquiry,
  addReplyToReply,
  updateReply,
  deleteReply,
  type InquiryDto,
  type InquiryReplyDto,
} from '@/services/inquiryService';
import styles from './page.module.css';

const INQUIRY_TYPE_LABELS: Record<string, string> = {
  GENERAL: '일반 문의',
  MENU: '메뉴/제품',
  ORDER: '주문/결제',
  STORE: '매장 이용',
  ETC: '기타',
};

function buildReplyTree(replies: InquiryReplyDto[] = []) {
  const topLevel = replies.filter((r) => r.parentReplyId == null);
  const byParent = new Map<number, InquiryReplyDto[]>();
  for (const r of replies) {
    if (r.parentReplyId != null) {
      const arr = byParent.get(r.parentReplyId) ?? [];
      arr.push(r);
      byParent.set(r.parentReplyId, arr);
    }
  }
  return { topLevel, byParent };
}

export default function InquiryDetailPage() {
  const params = useParams();
  const id = params?.id ? Number(params.id) : null;
  const { isAuthenticated, user } = useAuthStore();
  const [inquiry, setInquiry] = useState<InquiryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingFor, setAddingFor] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const refetch = useCallback(() => {
    if (id == null || isNaN(id)) return;
    getInquiry(id).then(setInquiry).catch(() => setInquiry(null));
  }, [id]);

  useEffect(() => {
    if (id == null || isNaN(id)) {
      setLoading(false);
      return;
    }
    getInquiry(id)
      .then(setInquiry)
      .catch(() => setInquiry(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddComment = async (parentReplyId: number) => {
    const content = newComment.trim();
    if (!content || !id) return;
    setSubmitting(true);
    try {
      await addReplyToReply(id, parentReplyId, content);
      setNewComment('');
      setAddingFor(null);
      refetch();
    } catch (e) {
      alert(e instanceof Error ? e.message : '댓글 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (reply: InquiryReplyDto) => {
    setEditingId(reply.id);
    setEditContent(reply.content);
  };

  const handleSaveEdit = async () => {
    if (editingId == null || !editContent.trim()) return;
    setSubmitting(true);
    try {
      await updateReply(editingId, editContent.trim());
      setEditingId(null);
      setEditContent('');
      refetch();
    } catch (e) {
      alert(e instanceof Error ? e.message : '수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (replyId: number) => {
    if (!confirm('이 댓글을 삭제할까요?')) return;
    setSubmitting(true);
    try {
      await deleteReply(replyId);
      refetch();
    } catch (e) {
      alert(e instanceof Error ? e.message : '삭제에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) return null;
  if (loading) return <main className={styles.main}><div className={styles.loading}>불러오는 중...</div></main>;
  if (!inquiry) return <main className={styles.main}><p className={styles.errorText}>문의를 찾을 수 없습니다.</p><Link href="/inquiries" className={styles.backLinkText}>← 이전으로</Link></main>;

  const userId = user?.id ? Number(user.id) : null;
  const { topLevel, byParent } = buildReplyTree(inquiry.replies);

  return (
    <main className={styles.main}>
      <div className={styles.page}>
        <Link href="/inquiries" className={styles.backLinkText}>← 이전으로</Link>
        <div className={styles.pageHeader}>
          <p className={styles.pageLabel}>Inquiry</p>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>{inquiry.isPrivate ? '[비밀] ' : ''}{inquiry.title}</h1>
            <span className={styles.inquiryTypeBadge}>{INQUIRY_TYPE_LABELS[inquiry.inquiryType ?? ''] ?? inquiry.inquiryType ?? '—'}</span>
          </div>
          <p className={styles.date}>{new Date(inquiry.createdAt).toLocaleString('ko-KR')}</p>
        </div>
        <div className={styles.card}>
          <div className={styles.content}>{inquiry.content || ''}</div>
        </div>

        {topLevel.length > 0 && (
          <section className={styles.replies}>
            <h2 className={styles.repliesTitle}>답변</h2>
            {topLevel.map((adminReply) => {
              const children = byParent.get(adminReply.id) ?? [];
              return (
                <div key={adminReply.id} className={styles.replyBlock}>
                  <div className={styles.reply}>
                    <span className={styles.replyRole}>관리자</span>
                    <p className={styles.replyContent}>{adminReply.content}</p>
                    <span className={styles.replyDate}>{new Date(adminReply.createdAt).toLocaleString('ko-KR')}</span>
                  </div>
                  <div className={styles.replyChildren}>
                    {children.map((userReply) => (
                      <div key={userReply.id} className={styles.replyChild}>
                        {editingId === userReply.id ? (
                          <>
                            <textarea
                              className={styles.replyTextarea}
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              rows={3}
                              disabled={submitting}
                            />
                            <div className={styles.replyActions}>
                              <button type="button" className={styles.btnPrimary} onClick={handleSaveEdit} disabled={submitting}>
                                저장
                              </button>
                              <button type="button" className={styles.btnSecondary} onClick={() => { setEditingId(null); setEditContent(''); }} disabled={submitting}>
                                취소
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className={styles.replyRole}>나</span>
                            <p className={styles.replyContent}>{userReply.content}</p>
                            <span className={styles.replyDate}>{new Date(userReply.createdAt).toLocaleString('ko-KR')}</span>
                            {userId != null && userReply.authorId === userId && (
                              <div className={styles.replyActions}>
                                <button type="button" className={styles.btnText} onClick={() => handleStartEdit(userReply)}>
                                  수정
                                </button>
                                <button type="button" className={styles.btnText} onClick={() => handleDelete(userReply.id)} disabled={submitting}>
                                  삭제
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className={styles.addCommentWrap}>
                    {addingFor === adminReply.id ? (
                      <div className={styles.addCommentForm}>
                        <textarea
                          className={styles.replyTextarea}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="댓글을 입력하세요"
                          rows={3}
                          disabled={submitting}
                        />
                        <div className={styles.replyActions}>
                          <button type="button" className={styles.btnPrimary} onClick={() => handleAddComment(adminReply.id)} disabled={submitting || !newComment.trim()}>
                            등록
                          </button>
                          <button type="button" className={styles.btnSecondary} onClick={() => { setAddingFor(null); setNewComment(''); }} disabled={submitting}>
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" className={styles.addCommentBtn} onClick={() => setAddingFor(adminReply.id)}>
                        댓글 추가
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
