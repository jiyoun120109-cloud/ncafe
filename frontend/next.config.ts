import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    async rewrites() {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8011';
        return {
            beforeFiles: [],
            afterFiles: [],
            // /images/* 는 백엔드 정적 파일 서버로 직접 전달
            fallback: [
                {
                    source: '/images/:path*',
                    destination: `${backendUrl}/:path*`,
                },
            ],
        };
    },
    images: {
        unoptimized: true,
    },
}

export default nextConfig
