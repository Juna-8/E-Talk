import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.ewha.ac.kr',
      },
    ],
  },
}

export default nextConfig
