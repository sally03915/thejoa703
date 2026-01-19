// ✅ axios 라이브러리 import
import axios from "axios";

// ✅ axios 인스턴스 생성
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080", 
  // → 기본 API 서버 주소. 환경변수 없으면 로컬 서버(8080) 사용

  withCredentials: true, 
  // → Refresh Token이 HttpOnly 쿠키에 저장되어 있으므로 자동 포함 필요

  headers: {
    "Content-Type": "application/json", // → 요청 기본 Content-Type
    Accept: "application/json",         // → 응답을 JSON으로 받도록 지정
  },
});

// ✅ 요청 인터셉터: 요청 보내기 전에 Access Token을 헤더에 추가
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") { 
      const accessToken = localStorage.getItem("accessToken"); 
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`; 
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 응답 인터셉터: 응답 받은 후 처리
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await api.post("/auth/refresh"); 
        const newAccessToken = data?.accessToken;

        if (typeof window !== "undefined" && newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
        }

        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(original);
      } catch (refreshErr) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
