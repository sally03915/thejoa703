import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { List, Avatar, Button, Card, Typography, Spin, message } from 'antd';
import { loadFollowingsRequest, unfollowRequest, updateBlockRequest } from '../reducers/followReducer';
import { wrapper } from '../store/configureStore';
import { loginSuccess } from '../reducers/authReducer';
import axios from '../api/axios';

const { Text } = Typography;

function FollowingsPage({ user: initialUser }) {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const { followings = [] } = useSelector((state) => state.follow);
  const currentUser = user || initialUser;

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(loadFollowingsRequest());
    }
  }, [currentUser?.id, dispatch]);

  if (loading) return <Spin />;
  if (!currentUser) return <p>로그인이 필요합니다.</p>;

  return (
    <Card title="팔로잉 목록" style={{ maxWidth: 700, margin: '20px auto' }}>
      <List
        itemLayout="horizontal"
        dataSource={followings}
        locale={{ emptyText: '아직 팔로잉이 없습니다.' }}
        renderItem={(item) => (
          <List.Item
            style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}
            actions={[
              <Button
                key="unfollow"
                danger
                onClick={() => {
                  // ✅ 팔로잉 탭에서는 상대방 id가 followeeId → 그대로 사용
                  dispatch(unfollowRequest({ followeeId: item.followeeId }));
                  message.success(`${item.nickname} 님을 언팔로우했습니다.`);
                }}
              >
                언팔로우
              </Button>,
              <Button
                key="block"
                type="default"
                onClick={() => {
                  // ✅ 팔로잉 탭에서도 상대방 id는 followeeId → 그대로 사용
                  dispatch(updateBlockRequest({ followeeId: item.followeeId, blocked: true }));
                  message.success(`${item.nickname} 님을 차단했습니다.`);
                }}
              >
                차단
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar size="large">{item.nickname?.[0]}</Avatar>}
              title={<Text strong>{item.nickname}</Text>}
              description={<Text type="secondary">{item.email}</Text>}
            />
          </List.Item>
        )}
      />
    </Card>
  );
}

export default FollowingsPage;

export const getServerSideProps = wrapper.getServerSideProps((store) => async (ctx) => {
  const cookie = ctx.req.headers.cookie || '';
  try {
    const res = await axios.get('/auth/me', { headers: { cookie } });
    const user = res.data;
    store.dispatch(loginSuccess({ user }));
    return { props: { user } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
});
