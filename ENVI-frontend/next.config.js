/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      // Add specific rule first to ensure it's matched
      {
        source: '/api/generate-charts/', // Match the exact path WITH the slash
        destination: 'http://127.0.0.1:8000/api/generate-charts/', // Proxy to the exact path WITH the slash
      },
      // Keep the general rule for other API paths
      {
        source: '/api/:path*', 
        destination: 'http://127.0.0.1:8000/api/:path*', 
      },
    ];
  },
}

module.exports = nextConfig 