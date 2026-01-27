// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*', // 백엔드 주소
      },
      {
        source: '/auth/:path*',
        destination: 'http://localhost:8080/auth/:path*', // 백엔드 주소
      },
      {
        source: '/oauth2/:path*',
        destination: 'http://localhost:8080/oauth2/:path*', // 백엔드 주소
      },
    ]
  },
}
