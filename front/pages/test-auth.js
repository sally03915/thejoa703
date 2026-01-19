import { useEffect, useState } from "react";
import axios from "axios";

export default function TestAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 로그인 먼저 실행
    axios.post("http://localhost:8484/auth/login", {
      email: "a@a",
      password: "a",
      provider: "local"
    }, { withCredentials: true })
    .then(res => {
      console.log("로그인 성공:", res.data);

      // 로그인 후 내 정보 호출
      return axios.get("http://localhost:8484/auth/me", { withCredentials: true });
    })
    .then(res => {
      setUser(res.data);
    })
    .catch(err => {
      console.error("에러:", err.response?.data || err.message);
    });
  }, []);

  return (
    <div>
      <h1>Auth 테스트</h1>
      {user ? (
        <pre>{JSON.stringify(user, null, 2)}</pre>
      ) : (
        <p>로그인 중...</p>
      )}
    </div>
  );
}
