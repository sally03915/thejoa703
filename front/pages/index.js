// ✅ 필요한 라이브러리 import
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spin, Alert, message, Tabs } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";

import {
  fetchPostsPagedRequest,
  fetchLikedPostsRequest,
  fetchMyAndRetweetsRequest,
  updatePostRequest,
} from "../reducers/postReducer";
import {
  addLikeRequest,
  removeLikeRequest,
  fetchMyLikesRequest,
} from "../reducers/likeReducer";
import {
  toggleFollowRequest,   // ✅ followRequest/unfollowRequest 대신 toggleFollowRequest 사용
  loadFollowingsRequest,
} from "../reducers/followReducer";
import { fetchMyRetweetsRequest } from "../reducers/retweetReducer";

import PostList from "../components/PostList";
import EditPostModal from "../components/EditPostModal";

export default function HomePage() {
  const dispatch = useDispatch();

  // ✅ Redux 상태
  const { posts, likedPosts, myAndRetweets, loading, error, hasNext } = useSelector((state) => state.post);
  const { user } = useSelector((state) => state.auth);
  const { likes = {}, likesCount = {}, loading: likeLoading } = useSelector((state) => state.like);
  const { followingsMap, loading: followLoading } = useSelector((state) => state.follow);
  const { retweets, retweetsCount } = useSelector((state) => state.retweet);

  // ✅ 로컬 상태
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [pageAll, setPageAll] = useState(1);

  // ✅ 첫 로딩
  useEffect(() => {
    dispatch(fetchPostsPagedRequest({ page: 1, size: 10 }));
    setPageAll(2);

    if (user) {
      dispatch(fetchLikedPostsRequest({ page: 1, size: 10 }));
      dispatch(fetchMyAndRetweetsRequest({ page: 1, size: 10 }));
      dispatch(fetchMyLikesRequest({ userId: user.id }));
      dispatch(fetchMyRetweetsRequest({ userId: user.id }));
      dispatch(loadFollowingsRequest());
    }
  }, [dispatch, user]);

  // ✅ 무한스크롤 추가 로딩
  const fetchMoreAll = () => {
    if (!hasNext) return;
    dispatch(fetchPostsPagedRequest({ page: pageAll, size: 10 }));
    setPageAll((prev) => prev + 1);
  };

  // ✅ 글 수정 모달 열기
  const handleEdit = (post) => {
    setEditPost(post);
    setIsEditModalVisible(true);
    setUploadFiles([]);
  };

  // ✅ 글 수정 제출
  const handleEditSubmit = (values) => {
    dispatch(updatePostRequest({
      postId: editPost.id,
      dto: {
        content: values.content,
        hashtags: Array.isArray(values.hashtags)
          ? values.hashtags.join(",")
          : values.hashtags,
      },
      files: uploadFiles,
    }));
    setIsEditModalVisible(false);
    setEditPost(null);
  };

  // ✅ 좋아요 토글
  const handleToggleLike = (postId) => {
    if (!user) {
      message.warning("로그인 후 이용 가능합니다.");
      window.location.href = "/login";
      return;
    }
    const key = String(postId);
    if (likes[key] === true) {
      dispatch(removeLikeRequest({ postId }));
    } else {
      dispatch(addLikeRequest({ postId }));
    }
    dispatch(fetchLikedPostsRequest({ page: 1, size: 10 }));
  };

  // ✅ 팔로우 토글
  const handleToggleFollow = (authorId) => {
    if (!user) {
      message.warning("로그인 후 이용 가능합니다.");
      window.location.href = "/login";
      return;
    }
    if (!authorId) {
      message.error("팔로우 대상 ID가 없습니다.");
      return;
    }
    dispatch(toggleFollowRequest(authorId));
  };

  if (loading && posts.length === 0) return <Spin tip="글 목록을 불러오는 중..." />;
  if (error) return <Alert type="error" message="글 목록 불러오기 실패" description={error} />;

  return (
    <>
      <Tabs
        defaultActiveKey="all"
        centered
        onChange={(key) => {
          if (key === "liked" && user) {
            dispatch(fetchLikedPostsRequest({ page: 1, size: 10 }));
          }
          if (key === "my" && user) {
            dispatch(fetchMyAndRetweetsRequest({ page: 1, size: 10 }));
          }
        }}
      >
        <Tabs.TabPane tab="전체 글" key="all">
          <InfiniteScroll
            dataLength={posts.length}
            next={fetchMoreAll}
            hasMore={hasNext}
            loader={<Spin tip="더 불러오는 중..." />}
            endMessage={<p style={{ textAlign: "center" }}>모든 글을 불러왔습니다</p>}
            style={{ overflow: "visible" }}
          >
            <PostList
              posts={posts}
              user={user}
              likes={likes}
              likesCount={likesCount}
              retweetedPosts={retweets}
              retweetsCount={retweetsCount}
              expandedPostId={expandedPostId}
              setExpandedPostId={setExpandedPostId}
              handleToggleLike={handleToggleLike}
              handleToggleFollow={handleToggleFollow}
              handleEdit={handleEdit}
              dispatch={dispatch}
              likeLoading={likeLoading}
              followingsMap={followingsMap}   // ✅ 네이밍 수정
              followLoading={followLoading}
            />
          </InfiniteScroll>
        </Tabs.TabPane>

        {user && (
          <Tabs.TabPane tab="좋아요한 글" key="liked">
            <PostList
              posts={likedPosts}
              user={user}
              likes={likes}
              likesCount={likesCount}
              retweetedPosts={retweets}
              retweetsCount={retweetsCount}
              expandedPostId={expandedPostId}
              setExpandedPostId={setExpandedPostId}
              handleToggleLike={handleToggleLike}
              handleToggleFollow={handleToggleFollow}
              handleEdit={handleEdit}
              dispatch={dispatch}
              likeLoading={likeLoading}
              followingsMap={followingsMap}   // ✅ 네이밍 수정
              followLoading={followLoading}
            />
          </Tabs.TabPane>
        )}

        {user && (
          <Tabs.TabPane tab="내 글+리트윗" key="my">
            <PostList
              posts={myAndRetweets}
              user={user}
              likes={likes}
              likesCount={likesCount}
              retweetedPosts={retweets}
              retweetsCount={retweetsCount}
              expandedPostId={expandedPostId}
              setExpandedPostId={setExpandedPostId}
              handleToggleLike={handleToggleLike}
              handleToggleFollow={handleToggleFollow}
              handleEdit={handleEdit}
              dispatch={dispatch}
              likeLoading={likeLoading}
              followingsMap={followingsMap}   // ✅ 네이밍 수정
              followLoading={followLoading}
            />
          </Tabs.TabPane>
        )}
      </Tabs>

      <EditPostModal
        visible={isEditModalVisible}
        editPost={editPost}
        onCancel={() => setIsEditModalVisible(false)}
        onSubmit={handleEditSubmit}
        uploadFiles={uploadFiles}
        setUploadFiles={setUploadFiles}
      />
    </>
  );
}
