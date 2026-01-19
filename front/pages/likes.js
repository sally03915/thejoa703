// ✅ 필요한 라이브러리와 액션 import
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spin, Alert } from "antd";
import InfiniteScroll from "react-infinite-scroll-component"; 
import { fetchMyLikesRequest } from "../reducers/likeReducer";

import PostList from "../components/PostList";

export default function LikesPage() {
  const dispatch = useDispatch();

  // ✅ Redux 상태 가져오기
  const { user } = useSelector((state) => state.auth);
  const { likedPosts, likesCount, loading, error } = useSelector((state) => state.like);

  // ✅ 로컬 상태 (페이징 + 무한 스크롤)
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [hasMore, setHasMore] = useState(true);

  // ✅ 첫 로딩
  useEffect(() => {
    if (user) {
      dispatch(fetchMyLikesRequest({ userId: user.id, page: 1, size }));
      setPage(2); // 다음 페이지 준비
    }
  }, [dispatch, user, size]);

  // ✅ 무한 스크롤 추가 로딩
  const fetchMoreLikes = () => {
    if (user) {
      dispatch(fetchMyLikesRequest({ userId: user.id, page, size }));
      setPage((prev) => prev + 1);
      if (likedPosts.length < page * size) {
        setHasMore(false);
      }
    }
  };

  // ✅ 로딩/에러 처리
  if (loading && likedPosts.length === 0) return <Spin tip="좋아요한 글을 불러오는 중..." />;
  if (error) return <Alert type="error" message="좋아요 목록 불러오기 실패" description={error} />;

  // ✅ 최신 글이 위로 오도록 정렬
  const sortedLikes = [...likedPosts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <>
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>내가 좋아요한 글</h2>

      <InfiniteScroll
        dataLength={likedPosts.length}
        next={fetchMoreLikes}
        hasMore={hasMore}
        loader={<Spin tip="더 불러오는 중..." />}
        endMessage={<p style={{ textAlign: "center" }}>모든 좋아요한 글을 불러왔습니다</p>}
        style={{ overflow: "visible" }}
      >
        <PostList
          posts={sortedLikes}          // ✅ 좋아요한 글 목록 전달
          user={user}                  // ✅ 현재 로그인 사용자
          likesCount={likesCount}      // ✅ 좋아요 개수 전달
          likedPosts={likedPosts}      // ✅ 좋아요 상태 전달
          dispatch={dispatch}          // ✅ 액션 디스패치 전달
        />
      </InfiniteScroll>
    </>
  );
}
