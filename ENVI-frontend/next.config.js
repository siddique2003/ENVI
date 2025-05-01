/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      // Only proxy specific Django API routes
      {
        source: '/api/upload-csv/',
        destination: 'http://127.0.0.1:8000/api/upload-csv/',
      },
      {
        source: '/api/generate-charts', 
        destination: 'http://127.0.0.1:8000/api/generate-charts',
      },
      {
        source: '/api/test-hypotheses/',
        destination: 'http://127.0.0.1:8000/api/test-hypotheses/',
      },
      {
        source: '/api/preview-data/',
        destination: 'http://127.0.0.1:8000/api/preview-data/',
      },
      {
        source: '/api/recommend-fields/',
        destination: 'http://127.0.0.1:8000/api/recommend-fields/',
      },
      // DO NOT add a general /api/:path* rewrite here
      // Requests to /api/auth/* should be handled by Next.js
    ];
  },
}

module.exports = nextConfig 