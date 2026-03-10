import { getApiBase } from '@/services/api';

export interface RagDocument {
    id: number;
    title?: string | null;
    content: string;
    createdAt: string;
}

export interface RagDocumentCreate {
    title?: string | null;
    content: string;
}

export interface RagDocumentUpdate {
    title?: string | null;
    content?: string;
}

export interface RagDocumentsResponse {
    documents: RagDocument[];
}

type RagFetchOptions = {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: object;
};

async function ragFetch<T>(
    path: string,
    options?: RagFetchOptions
): Promise<T> {
    const { method = 'GET', body } = options ?? {};
    const url = `${getApiBase()}/rag${path}`;
    const init: RequestInit = {
        method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    };
    if (body != null && method !== 'GET') {
        init.body = JSON.stringify(body);
    }
    const res = await fetch(url, init);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `RAG API error: ${res.status}`);
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}

export async function fetchRagDocuments(): Promise<RagDocument[]> {
    const data = await ragFetch<RagDocumentsResponse>('/documents');
    return data?.documents ?? [];
}

export async function createRagDocument(payload: RagDocumentCreate): Promise<RagDocument> {
    return ragFetch<RagDocument>('/documents', {
        method: 'POST',
        body: payload,
    });
}

export async function updateRagDocument(
    id: number,
    payload: RagDocumentUpdate
): Promise<RagDocument> {
    return ragFetch<RagDocument>(`/documents/${id}`, {
        method: 'PATCH',
        body: payload,
    });
}

export async function deleteRagDocument(id: number): Promise<void> {
    await ragFetch<void>(`/documents/${id}`, { method: 'DELETE' });
}
