// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8484/api/:path*', // 백엔드 주소
      },
      {
        source: '/auth/:path*',
        destination: 'http://localhost:8484/auth/:path*', // 백엔드 주소
      },
      {
        source: '/oauth/:path*',
        destination: 'http://localhost:8484/oauth/:path*', // 백엔드 주소
      },
    ]
  },
}
