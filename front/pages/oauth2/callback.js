// pages/oauth2/callback.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../reducers/authReducer";

export default function OAuth2CallbackPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!router.isReady) return;

    const { accessToken } = router.query;

    if (accessToken) {
      try {
        localStorage.setItem("accessToken", accessToken);
        fetchUser(accessToken);
      } catch (err) {
        console.error("OAuth2 callback error:", err);
        router.push("/login");
      }
    }
  }, [router.isReady, router.query]);

  const fetchUser = async (accessToken) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      if (res.ok) {
        const user = await res.json();
        dispatch(loginSuccess({ user, accessToken }));
        router.push("/mypage");
      } else {
        router.push("/login");
      }
    } catch (err) {
      console.error("User fetch error:", err);
      router.push("/login");
    }
  };

  return <p>소셜 로그인 처리 중입니다...</p>;
}
