// pages/login.js
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Form, Input, Button, Spin, message } from "antd";
import { useRouter } from "next/router";
import { loginSuccess, logout } from "../reducers/authReducer";
import api from "../api/axios"; // ✅ api/axios.js 사용

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, loading, error } = useSelector((state) => state.auth);

  const onFinish = async (values) => {
    try {
      // ✅ 백엔드 로그인 요청
      const res = await api.post(
        "/auth/login",
        { ...values, provider: "local" },
        { headers: { "Content-Type": "application/json" } }
      );

      const { accessToken, user } = res.data;

      if (accessToken && user) {
        localStorage.setItem("accessToken", accessToken);
        dispatch(loginSuccess({ user, accessToken }));
        message.success(`${user.nickname}님 환영합니다!`);
        router.push("/mypage");
      } else {
        dispatch(logout());
        message.error("로그인 정보를 확인할 수 없습니다.");
      }
    } catch (err) {
      dispatch(logout());
      message.error("로그인 실패: 이메일/비밀번호를 확인하세요.");
    }
  };

  // ✅ 소셜 로그인 핸들러 추가
  const handleSocialLogin = (provider) => {
    window.location.href = `http://localhost:8484/oauth2/authorization/${provider}`;
  };

  return (
    <Row justify="center" style={{ marginTop: 40 }}>
      <Col xs={24} sm={16} md={8}>
        {loading && <Spin />}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!user || !user.nickname ? (
          <>
            {/* ✅ local 로그인 폼 */}
            <Form onFinish={onFinish}>
              <Form.Item
                name="email"
                rules={[{ required: true, message: "이메일을 입력하세요" }]}
              >
                <Input placeholder="이메일" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: "비밀번호를 입력하세요" }]}
              >
                <Input.Password placeholder="비밀번호" />
              </Form.Item>
              <div style={{textAlign:'center'}}>
              <Button type="primary" htmlType="submit" loading={loading} style={{width:'200px',height:'45px'}} >
                로그인
              </Button>
              </div>
            </Form>

            {/* ✅ 소셜 로그인 이미지 버튼 */}
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <img
                src="/images/google.png"   // ✅ 구글 로그인 이미지
                alt="Google Login"
                style={{ cursor: "pointer", width: "200px", marginBottom: "10px" }}
                onClick={() => handleSocialLogin("google")}
              />
            </div>
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <img
                src="/images/kakao.png"    // ✅ 카카오 로그인 이미지
                alt="Kakao Login"
                style={{ cursor: "pointer", width: "200px", marginBottom: "10px" }}
                onClick={() => handleSocialLogin("kakao")}
              />
            </div>
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <img
                src="/images/naver.png"    // ✅ 네이버 로그인 이미지
                alt="Naver Login"
                style={{ cursor: "pointer", width: "200px" }}
                onClick={() => handleSocialLogin("naver")}
              />
            </div>
          </>
        ) : (
          <p>{user.nickname}님 환영합니다!</p>
        )}
      </Col>
    </Row>
  );
}

// SSR에서는 단순 렌더
export async function getServerSideProps() {
  return { props: {} };
}
