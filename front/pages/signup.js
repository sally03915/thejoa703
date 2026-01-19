// pages/signup.js
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Form, Input, Button, Upload, Spin, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { signupRequest , resetAuthState} from "../reducers/authReducer";
import axios from "../api/axios";

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.auth);

  const [fileList, setFileList] = useState([]);

  const onFinish = (values) => {
    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("nickname", values.nickname);
    formData.append("provider", "local");
    if (fileList.length > 0) {
      // ✅ 백엔드 컨트롤러에서 @RequestParam("ufile")로 받는 경우 필드명 맞추기
      formData.append("ufile", fileList[0].originFileObj);
    }
    dispatch(signupRequest(formData));
  };

  // ✅ 회원가입 성공 시 메시지 + 로그인 페이지 이동
  useEffect(() => {
    if (success) {
      message.success("회원가입이 성공적으로 완료되었습니다!");
      router.push("/login");
      dispatch(resetAuthState()); // 함수명 일치시킴
    }
  }, [success, router, dispatch]);


  return (
    <Row justify="center" style={{ marginTop: 40 }}>
      <Col xs={24} sm={16} md={8}>
        {loading && <Spin />}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!success && (
          <Form onFinish={onFinish} layout="vertical">
            {/* 이메일 입력 + 중복 검사 */}
            <Form.Item
              name="email"
              label="이메일"
              hasFeedback
              rules={[
                { required: true, message: "이메일을 입력하세요" },
                {
                  validator: async (_, value) => {
                    if (!value) return Promise.resolve();
                    try {
                      const res = await axios.get(
                        `/auth/check-email?email=${encodeURIComponent(value)}`
                      );
                      if (res?.data === true) {
                        return Promise.reject(
                          new Error("이미 사용 중인 이메일입니다.")
                        );
                      }
                      return Promise.resolve();
                    } catch (err) {
                      console.error("이메일 중복 검사 오류:", err);
                      return Promise.reject(new Error("중복 검사 실패"));
                    }
                  },
                },
              ]}
            >
              <Input />
            </Form.Item>

            {/* 비밀번호 입력 */}
            <Form.Item
              name="password"
              label="비밀번호"
              rules={[{ required: true, message: "비밀번호를 입력하세요" }]}
            >
              <Input.Password />
            </Form.Item>

            {/* 닉네임 입력 + 중복 검사 */}
            <Form.Item
              name="nickname"
              label="닉네임"
              hasFeedback
              rules={[
                { required: true, message: "닉네임을 입력하세요" },
                {
                  validator: async (_, value) => {
                    if (!value) return Promise.resolve();
                    try {
                      const res = await axios.get(
                        `/auth/check-nickname?nickname=${encodeURIComponent(value)}`
                      );
                      if (res?.data === true) {
                        return Promise.reject(
                          new Error("이미 사용 중인 닉네임입니다.")
                        );
                      }
                      return Promise.resolve();
                    } catch (err) {
                      console.error("닉네임 중복 검사 오류:", err);
                      return Promise.reject(new Error("중복 검사 실패"));
                    }
                  },
                },
              ]}
            >
              <Input />
            </Form.Item>

            {/* 프로필 이미지 업로드 */}
            <Form.Item name="profileImage" label="프로필 이미지">
              <Upload
                beforeUpload={() => false}
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>이미지 선택</Button>
              </Upload>
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={loading}>
              회원가입
            </Button>
          </Form>
        )}
      </Col>
    </Row>
  );
} 