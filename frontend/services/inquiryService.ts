import { getApiBase } from '@/services/api';

export interface InquiryDto {
  id: number;
  userId: number;
  title: string;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  hasReply?: boolean;
  replies?: InquiryReplyDto[];
}

export interface InquiryReplyDto {
  id: number;
  content: string;
  authorId?: number | null;
  parentReplyId?: number | null;
  createdAt: string;
}

export async function getMyInquiries(): Promise<InquiryDto[]> {
  const res = await fetch(`${getApiBase()}/inquiries/my`, { credentials: 'include' });
  if (res.status === 401) throw new Error('로그인이 필요합니다.');
  if (!res.ok) throw new Error('문의 목록을 불러올 수 없습니다.');
  return res.json();
}

export async function getInquiry(id: number): Promise<InquiryDto> {
  const res = await fetch(`${getApiBase()}/inquiries/${id}`, { credentials: 'include' });
  if (res.status === 401) throw new Error('로그인이 필요합니다.');
  if (!res.ok) throw new Error('문의를 불러올 수 없습니다.');
  return res.json();
}

export async function createInquiry(params: { title: string; content?: string; isPrivate?: boolean }): Promise<InquiryDto> {
  const res = await fetch(`${getApiBase()}/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(params),
  });
  if (res.status === 401) throw new Error('로그인이 필요합니다.');
  if (!res.ok) throw new Error('문의 등록에 실패했습니다.');
  return res.json();
}

/** 관리자 답변에 대댓글 추가 */
export async function addReplyToReply(inquiryId: number, parentReplyId: number, content: string): Promise<InquiryReplyDto> {
  const res = await fetch(`${getApiBase()}/inquiries/${inquiryId}/replies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content: content.trim(), parentReplyId }),
  });
  if (res.status === 401) throw new Error('로그인이 필요합니다.');
  if (!res.ok) throw new Error('댓글 등록에 실패했습니다.');
  return res.json();
}

/** 대댓글 수정 (본인 댓글만) */
export async function updateReply(replyId: number, content: string): Promise<InquiryReplyDto> {
  const res = await fetch(`${getApiBase()}/inquiries/replies/${replyId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content: content.trim() }),
  });
  if (res.status === 401) throw new Error('로그인이 필요합니다.');
  if (res.status === 403) throw new Error('수정 권한이 없습니다.');
  if (!res.ok) throw new Error('댓글 수정에 실패했습니다.');
  return res.json();
}

/** 대댓글 삭제 (본인 댓글만) */
export async function deleteReply(replyId: number): Promise<void> {
  const res = await fetch(`${getApiBase()}/inquiries/replies/${replyId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (res.status === 401) throw new Error('로그인이 필요합니다.');
  if (res.status === 403) throw new Error('삭제 권한이 없습니다.');
  if (!res.ok) throw new Error('댓글 삭제에 실패했습니다.');
}
