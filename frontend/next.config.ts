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
            // BFF: /images/*, /upload/* → 백엔드 /upload/* (WebConfig addResourceHandlers)
            source: '/images/:path*',
            destination: `${backendUrl}/upload/:path*`,
          },
          {
            source: '/upload/:path*',
            destination: `${backendUrl}/upload/:path*`,
          },
          {
            source: '/:file(.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico))$',
            destination: `${backendUrl}/upload/:file`,
          },
        ];
      },
}

export default nextConfig
