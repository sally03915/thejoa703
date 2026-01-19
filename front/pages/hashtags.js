import { useState, useEffect } from "react";
import { Spin, Alert, Empty } from "antd";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import axios from "../api/axios";

import PostList from "../components/PostList";
import EditPostModal from "../components/EditPostModal";

import {
  fetchMyLikesRequest,
  addLikeRequest,
  removeLikeRequest,
} from "../reducers/likeReducer";
import { fetchMyRetweetsRequest } from "../reducers/retweetReducer";
import { updatePostRequest } from "../reducers/postReducer";

export default function HashtagPage() {
  const router = useRouter();
  const { tag } = router.query;
  const dispatch = useDispatch();

  // ✅ Redux 상태
  const { user } = useSelector((state) => state.auth);
  const { likesCount, likedPosts, loading: likeLoading } = useSelector((state) => state.like);
  const { retweets, retweetsCount } = useSelector((state) => state.retweet);

  // ✅ 로컬 상태
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);

  // ✅ 해시태그 검색 API 호출
  useEffect(() => {
    if (tag) {
      setLoading(true);
      axios
        .get(`/api/posts/search/hashtag?tag=${tag}`)
        .then((res) => setPosts(res.data))
        .catch((err) => {
          console.error(err);
          setError("검색 결과를 불러오지 못했습니다.");
          setPosts([]);
        })
        .finally(() => setLoading(false));
    }
  }, [tag]);

  // ✅ 로그인 시 좋아요/리트윗 상태 불러오기
  useEffect(() => {
    if (user) {
      dispatch(fetchMyLikesRequest({ userId: user.id }));
      dispatch(fetchMyRetweetsRequest({ userId: user.id }));
    }
  }, [user, dispatch]);

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
    if (!user) return;
    if (likedPosts[postId]) {
      dispatch(removeLikeRequest({ postId }));
    } else {
      dispatch(addLikeRequest({ postId }));
    }
  };

  // ✅ 로딩/에러 처리
  if (loading) return <Spin tip="검색 결과 불러오는 중..." />;
  if (error) return <Alert type="error" message="검색 실패" description={error} />;
  if (posts.length === 0) return <Empty description="검색 결과가 없습니다" />;

  // ✅ 최신 글 정렬
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <>
      <PostList
        posts={sortedPosts}
        user={user}
        likesCount={likesCount}
        likedPosts={likedPosts}
        retweetedPosts={retweets}
        retweetsCount={retweetsCount}
        expandedPostId={expandedPostId}
        setExpandedPostId={setExpandedPostId}
        handleToggleLike={handleToggleLike}
        handleEdit={handleEdit}
        dispatch={dispatch}
        likeLoading={likeLoading}
      />

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
