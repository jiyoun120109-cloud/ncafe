import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    async rewrites() {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
        if (process.env.NODE_ENV === 'development') {
            return [
                {
                    source: '/api/:path*',
                    destination: `${backendUrl}/:path*`,
                },
                {
                    source: '/images/:path*',
                    destination: `${backendUrl}/:path*`,
                }
            ]
        } return []
    },
    images: {
        unoptimized: true,

    },
}

export default nextConfig
