/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui.aceternity.com',
        port: '',
        pathname: '/_next/image/**',
      },
      {
        protocol: 'https',
        hostname: 'images-ext-1.discordapp.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.discordapp.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Desabilitar Next.js Dev Tools em produção
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
}

export default nextConfig
