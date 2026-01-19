// ✅ SSR 쿠키 파싱
import cookie from "cookie";
import { message } from "antd";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card, Avatar, Spin, Descriptions, Form, Input, Button, Upload, List, Tabs,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/router";

// ✅ authReducer 액션들
import {
  updateNicknameRequest,
  updateProfileImageRequest,
  loginSuccess,
  logout,
} from "../reducers/authReducer";

// ✅ followReducer 액션들
import {
  loadFollowersRequest,
  loadFollowingsRequest,
  unfollowRequest,
} from "../reducers/followReducer";   // ⬅️ updateBlockRequest 제거

import api from "../api/axios";
import { wrapper } from "../store/configureStore";

const { TabPane } = Tabs;

function MyPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, loading } = useSelector((state) => state.auth);

  const {
    followersList = [],
    followingsList = [],
    followLoading = false,
  } = useSelector((state) => state.follow);

  const [fileList, setFileList] = useState([]);

  // ✅ CSR 인증 재확인
  useEffect(() => {
    const verify = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const me = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        if (me?.data && me.data.nickname) {
          dispatch(loginSuccess({ user: me.data }));
        } else {
          dispatch(logout());
          router.replace("/login");
        }
      } catch {
        dispatch(logout());
        router.replace("/login");
      }
    };
    verify();
  }, [dispatch, router]);

  // ✅ 팔로워/팔로잉 목록 불러오기
  useEffect(() => {
    if (user?.id) {
      dispatch(loadFollowersRequest());
      dispatch(loadFollowingsRequest());
    }
  }, [user?.id, dispatch]);

  if (loading) return <Spin />;
  if (!user || !user.nickname) return <p>로그인이 필요합니다.</p>;

  const imageUrl = user?.ufile
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/${user.ufile}`
    : undefined;

  return (
    <Card title="마이페이지" style={{ maxWidth: 800, margin: "20px auto" }}>
      <Tabs defaultActiveKey="profile">
        {/* ✅ 내 정보 탭 */}
        <TabPane tab="내 정보" key="profile">
          <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
            <Avatar src={imageUrl} size={64}>
              {user.nickname?.[0]}
            </Avatar>
            <Descriptions bordered column={1} size="middle" style={{ marginLeft: 20 }}>
              <Descriptions.Item label="이메일">{user.email}</Descriptions.Item>
              <Descriptions.Item label="닉네임">{user.nickname}</Descriptions.Item>
              <Descriptions.Item label="권한">{user.role}</Descriptions.Item>
            </Descriptions>
          </div>

          {/* 닉네임 수정 */}
          <Form
            onFinish={(values) =>
              dispatch(updateNicknameRequest({ userId: user.id, nickname: values.nickname }))
            }
            layout="inline"
            style={{ marginBottom: 20 }}
          >
            <Form.Item
              name="nickname"
              rules={[{ required: true, message: "새 닉네임을 입력하세요" }]}
            >
              <Input placeholder="새 닉네임" />
            </Form.Item>
            <Button type="primary" htmlType="submit">닉네임 변경</Button>
          </Form>

          {/* 프로필 이미지 수정 */}
          <Form layout="inline" style={{ marginBottom: 20 }}>
            <Form.Item>
              <Upload
                beforeUpload={() => false}
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>이미지 선택</Button>
              </Upload>
            </Form.Item>
            <Button
              type="primary"
              onClick={() => {
                if (!user || fileList.length === 0) return;
                const file = fileList[0]?.originFileObj;
                dispatch(updateProfileImageRequest({ userId: user.id, file }));
              }}
            >
              프로필 이미지 변경
            </Button>
          </Form> 

          {/* 회원 탈퇴 */}
          <Form layout="inline" style={{ marginBottom: 20 }}>
            <Form.Item>
              <Button
                danger
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("accessToken");
                    await api.delete("/auth/me", {
                      headers: { Authorization: `Bearer ${token}` },
                      withCredentials: true,
                    });

                    message.success("회원 탈퇴가 완료되었습니다.");
                    dispatch(logout());
                    router.replace("/login");
                  } catch (err) {
                    console.error("탈퇴 실패:", err);
                    message.error("회원 탈퇴에 실패했습니다.");
                  }
                }}
              >
                회원 탈퇴
              </Button>
            </Form.Item>
          </Form>
        </TabPane>

        {/* ✅ 팔로워 탭 */}
        <TabPane tab={`팔로워 (${followersList.length})`} key="followers">
          <List
            loading={followLoading}
            dataSource={Array.isArray(followersList) ? followersList : []}
            renderItem={(item) => (
              <List.Item actions={[]}>
                <List.Item.Meta
                  avatar={<Avatar>{item.nickname?.[0]}</Avatar>}
                  title={item.nickname}
                  description={item.email}
                />
              </List.Item>
            )}
          />
          <Link href="/followers" passHref>
            <Button type="link">전체 보기</Button>
          </Link>
        </TabPane>

        {/* ✅ 팔로잉 탭 */}
        <TabPane tab={`팔로잉 (${followingsList.length})`} key="following">
          <List
            loading={followLoading}
            dataSource={Array.isArray(followingsList) ? followingsList : []}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    key="unfollow"
                    onClick={() => dispatch(unfollowRequest({ followeeId: item.followeeId }))}
                  >
                    언팔로우
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar>{item.nickname?.[0]}</Avatar>}
                  title={item.nickname}
                  description={item.email}
                />
              </List.Item>
            )}
          />
          <Link href="/followings" passHref>
            <Button type="link">전체 보기</Button>
          </Link>
        </TabPane>
      </Tabs>
    </Card>
  );
}

export default MyPage;

// ✅ SSR 보호 로직
export const getServerSideProps = wrapper.getServerSideProps((store) => async (ctx) => {
  try {
    const me = await api.get("/auth/me", {
      headers: { cookie: ctx.req.headers.cookie || "" },
      withCredentials: true,
    });

    if (me?.data && me.data.nickname) {
      store.dispatch(loginSuccess({ user: me.data }));
      return { props: {} };
    }
  } catch (error) { 
    // ✅ 인증 실패 시 로그인 페이지로 리다이렉트
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  // ✅ 기본 props 반환
  return { props: {} };
});
