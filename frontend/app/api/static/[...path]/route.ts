import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_BASE_URL || process.env.BACKEND_URL || 'http://localhost:8011';

/**
 * 백엔드 정적 파일(이미지 등) 프록시.
 * GET /api/static/avatars/17.jpg → backend/avatars/17.jpg
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const relativePath = path.join('/');
  if (!relativePath) return new NextResponse(null, { status: 404 });
  const targetUrl = `${API_BASE.replace(/\/$/, '')}/${relativePath}`;
  try {
    const res = await fetch(targetUrl);
    if (!res.ok) return new NextResponse(null, { status: res.status });
    const contentType = res.headers.get('content-type');
    const headers = new Headers();
    if (contentType) headers.set('Content-Type', contentType);
    return new NextResponse(res.body, { status: 200, headers });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
