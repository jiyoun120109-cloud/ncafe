'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  getInquiry,
  updateInquiry,
  deleteInquiry,
  uploadInquiryAttachment,
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
  const router = useRouter();
  const id = params?.id ? Number(params.id) : null;
  const { isAuthenticated, user } = useAuthStore();
  const [inquiry, setInquiry] = useState<InquiryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingFor, setAddingFor] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editingInquiry, setEditingInquiry] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editIsPrivate, setEditIsPrivate] = useState(false);
  const [editAttachmentUrl, setEditAttachmentUrl] = useState<string | null>(null);
  const [editAttachmentName, setEditAttachmentName] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userId = user?.id ? Number(user.id) : null;

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

  const isMine = inquiry != null && userId != null && inquiry.userId === userId;

  const handleStartEditInquiry = () => {
    if (!inquiry) return;
    setEditTitle(inquiry.title);
    setEditBody(inquiry.content ?? '');
    setEditIsPrivate(inquiry.isPrivate ?? false);
    setEditAttachmentUrl(inquiry.attachmentUrl ?? null);
    setEditAttachmentName(inquiry.attachmentUrl ? inquiry.attachmentUrl.split('/').pop() ?? '첨부파일' : null);
    setEditingInquiry(true);
  };

  const handleCancelEditInquiry = () => {
    setEditingInquiry(false);
    setEditTitle('');
    setEditBody('');
    setEditIsPrivate(false);
    setEditAttachmentUrl(null);
    setEditAttachmentName(null);
  };

  const handleFileChangeEdit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const { attachmentUrl: url } = await uploadInquiryAttachment(file);
      setEditAttachmentUrl(url);
      setEditAttachmentName(file.name);
    } catch (err) {
      alert(err instanceof Error ? err.message : '파일 업로드에 실패했습니다.');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleSaveEditInquiry = async () => {
    if (!id || !editTitle.trim()) return;
    setSubmitting(true);
    try {
      const updated = await updateInquiry(id, {
        title: editTitle.trim(),
        content: editBody.trim(),
        isPrivate: editIsPrivate,
        attachmentUrl: editAttachmentUrl ?? undefined,
      });
      setInquiry(updated);
      setEditingInquiry(false);
      handleCancelEditInquiry();
    } catch (e) {
      alert(e instanceof Error ? e.message : '수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelInquiry = async () => {
    if (!id || !confirm('이 문의를 취소(삭제)하시겠습니까? 삭제 후에는 복구할 수 없습니다.')) return;
    setSubmitting(true);
    try {
      await deleteInquiry(id);
      router.push('/inquiries');
    } catch (e) {
      alert(e instanceof Error ? e.message : '취소에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) return null;
  if (loading) return <main className={styles.main}><div className={styles.loading}>불러오는 중...</div></main>;
  if (!inquiry) return <main className={styles.main}><p className={styles.errorText}>문의를 찾을 수 없습니다.</p><Link href="/inquiries" className={styles.backLinkText}>← 이전으로</Link></main>;

  const { topLevel, byParent } = buildReplyTree(inquiry.replies);

  const attachmentDownloadUrl = inquiry.attachmentUrl
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/api/static/${inquiry.attachmentUrl}`
    : null;

  return (
    <main className={styles.main}>
      <div className={styles.page}>
        <Link href="/inquiries" className={styles.backLinkText}>← 이전으로</Link>
        <div className={styles.pageHeader}>
          <p className={styles.pageLabel}>Inquiry</p>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>{inquiry.isPrivate ? '[비밀] ' : ''}{inquiry.title}</h1>
            <span className={styles.inquiryTypeBadge}>{INQUIRY_TYPE_LABELS[inquiry.inquiryType ?? ''] ?? inquiry.inquiryType ?? '—'}</span>
            {isMine && !editingInquiry && (
              <div className={styles.inquiryActions}>
                <button type="button" className={styles.btnText} onClick={handleStartEditInquiry} disabled={submitting}>
                  수정
                </button>
                <span className={styles.actionDivider}>|</span>
                <button type="button" className={styles.btnTextDanger} onClick={handleCancelInquiry} disabled={submitting}>
                  취소
                </button>
              </div>
            )}
          </div>
          <p className={styles.date}>{new Date(inquiry.createdAt).toLocaleString('ko-KR')}</p>
        </div>

        {editingInquiry ? (
          <div className={styles.card}>
            <label className={styles.editLabel}>
              제목
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className={styles.editInput}
                disabled={submitting}
              />
            </label>
            <label className={styles.editLabel}>
              내용
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                className={styles.editTextarea}
                rows={6}
                disabled={submitting}
              />
            </label>
            <div className={styles.editLabel}>
              첨부 파일
              <div className={styles.fileRow}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={handleFileChangeEdit}
                  className={styles.fileInput}
                  disabled={uploadingFile}
                />
                <button type="button" className={styles.fileBtn} onClick={() => fileInputRef.current?.click()} disabled={uploadingFile}>
                  {uploadingFile ? '업로드 중...' : '파일 선택'}
                </button>
                {editAttachmentName && (
                  <span className={styles.fileName}>
                    {editAttachmentName}
                    <button type="button" className={styles.fileRemove} onClick={() => { setEditAttachmentUrl(null); setEditAttachmentName(null); }} aria-label="제거">×</button>
                  </span>
                )}
              </div>
            </div>
            <label className={styles.editCheckbox}>
              <input type="checkbox" checked={editIsPrivate} onChange={(e) => setEditIsPrivate(e.target.checked)} disabled={submitting} />
              비밀글로 작성
            </label>
            <div className={styles.replyActions}>
              <button type="button" className={styles.btnPrimary} onClick={handleSaveEditInquiry} disabled={submitting || !editTitle.trim()}>
                저장
              </button>
              <button type="button" className={styles.btnSecondary} onClick={handleCancelEditInquiry} disabled={submitting}>
                취소
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.card}>
            <div className={styles.content}>{inquiry.content || ''}</div>
            {attachmentDownloadUrl && (
              <p className={styles.attachmentRow}>
                <span className={styles.attachmentLabel}>첨부:</span>
                <a href={attachmentDownloadUrl} target="_blank" rel="noopener noreferrer" className={styles.attachmentLink}>
                  {inquiry.attachmentUrl?.split('/').pop() ?? '첨부파일'}
                </a>
              </p>
            )}
          </div>
        )}

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
