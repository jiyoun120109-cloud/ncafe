import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    images: {
        unoptimized: true,
        remotePatterns: [
            { protocol: 'http', hostname: 'localhost', port: '8011', pathname: '/**' },
            { protocol: 'http', hostname: 'backend', port: '8011', pathname: '/**' },
        ],
    },
    async rewrites() {
        // 로컬: BACKEND_URL 또는 API_BASE_URL / 도커: API_BASE_URL=http://backend:8011
        const raw = process.env.API_BASE_URL || process.env.BACKEND_URL || 'http://localhost:8011';
        const backendUrl = raw.replace(/\/$/, '');
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
