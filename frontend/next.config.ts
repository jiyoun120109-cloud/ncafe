import type { NextConfig } from 'next'

// 모듈 로드 시점(서버 기동 시)에 백엔드 URL 고정 — rewrite/이미지 프록시가 동일한 값 사용
const BACKEND_BASE =
    process.env.API_BASE_URL || process.env.BACKEND_URL || 'http://localhost:8011';

const nextConfig: NextConfig = {
    images: {
        unoptimized: true,
        remotePatterns: [
            { protocol: 'http', hostname: 'localhost', port: '8011', pathname: '/**' },
            { protocol: 'http', hostname: 'backend', port: '8011', pathname: '/**' },
        ],
    },
    async rewrites() {
        const backendUrl = BACKEND_BASE.replace(/\/$/, '');
        return [
          {
            // BFF: /images/* → 백엔드 루트 (static-locations=file:./upload/ 가 경로 그대로 파일로 매핑)
            source: '/images/:path*',
            destination: `${backendUrl}/:path*`,
          },
          {
            source: '/upload/:path*',
            destination: `${backendUrl}/:path*`,
          },
          {
            source: '/:file(.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico))$',
            destination: `${backendUrl}/:file`,
          },
        ];
      },
}

export default nextConfig
