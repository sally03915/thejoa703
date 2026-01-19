import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { List, Avatar, Button, Card, Typography, Spin, message } from 'antd';
import { loadFollowersRequest, updateBlockRequest } from '../reducers/followReducer'; // ✅ unfollowRequest 제거
import { wrapper } from '../store/configureStore';
import { loginSuccess } from '../reducers/authReducer';
import axios from '../api/axios';

const { Text } = Typography;

function FollowersPage({ user: initialUser }) {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const { followers = [] } = useSelector((state) => state.follow);
  const currentUser = user || initialUser;

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(loadFollowersRequest());
    }
  }, [currentUser?.id, dispatch]);

  if (loading) return <Spin />;
  if (!currentUser) return <p>로그인이 필요합니다.</p>;

  return (
    <Card title="팔로워 목록" style={{ maxWidth: 700, margin: '20px auto' }}>
      <List
        itemLayout="horizontal"
        dataSource={followers}
        locale={{ emptyText: '아직 팔로워가 없습니다.' }}
        renderItem={(item) => (
          <List.Item
            style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}
            actions={[
              <Button
                key="block"
                type="default"
                onClick={() => {
                  // ✅ 팔로워 탭에서는 상대방 id가 followerId → 이를 followeeId로 넘김
                  dispatch(updateBlockRequest({ followeeId: item.followerId, blocked: true }));
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

export default FollowersPage;

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
