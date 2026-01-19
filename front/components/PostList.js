// ✅ 필요한 라이브러리 import
import { Card, List } from "antd";
import PostCard from "./PostCard";

/**
 * ✅ PostList 컴포넌트
 * - posts 배열을 받아 PostCard 리스트로 렌더링
 * - followingsMap 네이밍 일관성 유지
 * - 빈 배열 안전 처리
 * - key 속성 및 rowKey 추가
 * - title props로 동적 처리 가능
 */
export default function PostList({
  posts,
  user,
  likes,
  likesCount,
  retweetedPosts,
  retweetsCount,
  expandedPostId,
  setExpandedPostId,
  handleToggleLike,
  handleToggleFollow,
  handleEdit,
  dispatch,
  likeLoading,
  followingsMap,   // ✅ 이름을 followingsMap으로 통일
  followLoading,
  title = "피드",
}) {
  return (
    <div style={{ minHeight: "100vh", padding: "30px 0" }}>
      <Card
        title={title}
        style={{
          maxWidth: 700,
          margin: "0 auto",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          backgroundColor: "rgba(255,255,255,0.9)",
        }}
      >
        <List
          itemLayout="vertical"
          dataSource={posts || []}
          rowKey={(post) => post.id}   // ✅ 안정적 key 지정
          renderItem={(post) => (
            <PostCard
              post={post}
              user={user}
              likes={likes}
              likesCount={likesCount}
              retweetedPosts={retweetedPosts}
              retweetsCount={retweetsCount}
              expandedPostId={expandedPostId}
              setExpandedPostId={setExpandedPostId}
              handleToggleLike={handleToggleLike}
              handleToggleFollow={handleToggleFollow}
              handleEdit={handleEdit}
              dispatch={dispatch}
              likeLoading={likeLoading}
              followingsMap={followingsMap}   // ✅ 이름 일관성 유지
              followLoading={followLoading}
            />
          )}
        />
      </Card>
    </div>
  );
}
