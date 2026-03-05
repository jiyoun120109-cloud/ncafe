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
            // /upload/*, /images/* → 백엔드 루트 (static-locations가 file:./upload 또는 file:///app/upload 서빙)
            source: '/upload/:path*',
            destination: `${backendUrl}/:path*`,
          },
          {
            source: '/images/:path*',
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
