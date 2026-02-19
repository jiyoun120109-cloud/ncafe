import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    async rewrites() {
        if (process.env.NODE_ENV === 'development') {
            return [
                {
                    source: '/api/:path*',
                    destination: 'http://backend:8011/:path*',
                },
                {
                    source: '/images/:path*',
                    destination: 'http://backend:8011/:path*',
                }
            ]
        } return []
    },
    images: {
        unoptimized: true,

    },
}

export default nextConfig
