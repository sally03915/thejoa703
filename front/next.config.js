/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ 이미지 도메인 허용
  images: {
    domains: ['placehold.co', 'images.unsplash.com'],
  },

  // ✅ API 프록시 설정 (백엔드: localhost:8484 → 프론트: localhost:3060/api)
  async rewrites() {
    return [
      {
        source: '/api/:path*',              // 프론트에서 /api/... 로 호출
        destination: 'http://localhost:8484/:path*', // 백엔드로 프록시
      },
    ];
  },
};

module.exports = nextConfig;
