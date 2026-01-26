// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8484/api/:path*', // 백엔드 주소
      },
    ]
  },
}
